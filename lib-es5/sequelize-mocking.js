/**
 * Base service for mocking with Sequelize
 *
 * @module lib/sequelize-mocking
 * @exports SequelizeMocking
 * @version 0.1.0
 * @since 0.1.0
 * @author Julien Roche
 */

'use strict';

// Imports

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sequelize = require('sequelize');
var _ = Sequelize.Utils._;
var sequelizeFixtures = require('sequelize-fixtures');

// Constants and variables
var FAKE_DATABASE_NAME = 'test-database';
var AFTER_DEFINE_EVENT = 'afterDefine';
var SQLITE_SEQUELIZE_OPTIONS = {
    'dialect': 'sqlite',
    'storage': ':memory:'
};

/**
 * @class SequelizeMockingOptions
 * @property {boolean} [logging=true]
 */

/**
 * Sequelize mocking service
 */

var SequelizeMocking = function () {
    function SequelizeMocking() {
        _classCallCheck(this, SequelizeMocking);
    }

    _createClass(SequelizeMocking, null, [{
        key: 'adaptSequelizeOptions',

        /**
         * @param {Sequelize} sequelizeInstance
         * @param {SequelizeMockingOptions} [options]
         * @returns {Sequelize} Mocked Sequelize object
         */
        value: function adaptSequelizeOptions(sequelizeInstance, options) {
            var optionsExtended = _.merge({}, sequelizeInstance.options, SQLITE_SEQUELIZE_OPTIONS, { 'logging': options && !options.logging ? false : console.log });

            return optionsExtended;
        }

        /**
         * @param {Sequelize} sequelizeInstance
         * @param {Sequelize.Model} model
         * @returns {Sequelize.Model}
         */

    }, {
        key: 'copyModel',
        value: function copyModel(sequelizeInstance, model) {
            var newModel = new Sequelize.Model(model.name, _.merge({}, model.attributes), _.merge({}, model.options, { 'sequelize': sequelizeInstance }));

            newModel = newModel.init(sequelizeInstance.modelManager);
            sequelizeInstance.modelManager.addModel(model);
            return newModel;
        }

        /**
         * @param {Sequelize} originalSequelize
         * @param {Sequelize} mockedSequelize
         * @returns {Sequelize} Mocked Sequelize object
         */

    }, {
        key: 'copyCurrentModels',
        value: function copyCurrentModels(originalSequelize, mockedSequelize) {
            originalSequelize.modelManager.all.forEach(function (model) {
                SequelizeMocking.copyModel(mockedSequelize, model);
            });

            return mockedSequelize;
        }

        /**
         * @param {Sequelize} originalSequelize
         * @param {SequelizeMockingOptions} [options]
         * @returns {Promise.<Sequelize>}
         */

    }, {
        key: 'create',
        value: function create(originalSequelize, options) {
            var logging = !options || options.logging;
            var mockedSequelize = new Sequelize(FAKE_DATABASE_NAME, null, null, SequelizeMocking.adaptSequelizeOptions(originalSequelize, options));

            mockedSequelize.__originalSequelize = originalSequelize;

            SequelizeMocking.copyCurrentModels(originalSequelize, mockedSequelize);
            SequelizeMocking.hookNewModel(originalSequelize, mockedSequelize, options);

            logging && console.log('SequelizeMocking - Mock the context');
            return mockedSequelize.sync().then(function () {
                logging && console.log('SequelizeMocking - Database construction done');
                return mockedSequelize;
            });
        }

        /**
         * @param {Sequelize} originalSequelize
         * @param {string} fixtureFilePath
         * @param {SequelizeMockingOptions} [options]
         * @returns {Promise.<Sequelize>}
         */

    }, {
        key: 'createAndLoadFixtureFile',
        value: function createAndLoadFixtureFile(originalSequelize, fixtureFilePath, options) {
            var logging = !options || options.logging;

            return SequelizeMocking.create(originalSequelize, options).then(function (mockedSequelize) {
                return SequelizeMocking.loadFixtureFile(mockedSequelize, fixtureFilePath, options).then(function () {
                    logging && console.log('SequelizeMocking - Mocked data injected');
                    return mockedSequelize;
                });
            });
        }

        /**
         * @param {Sequelize} originalSequelize
         * @param {Sequelize} mockedSequelize
         * @param {SequelizeMockingOptions} [options]
         */

    }, {
        key: 'hookNewModel',
        value: function hookNewModel(originalSequelize, mockedSequelize, options) {
            var logging = !options || options.logging;

            originalSequelize.addHook(AFTER_DEFINE_EVENT, function (newModel) {
                SequelizeMocking.copyModel(mockedSequelize, newModel).sync({ 'hooks': true }).then(function () {
                    logging && console.log('Model ' + newModel.name + ' was declared into the database');
                }).catch(function (err) {
                    logging && console.error('An error occured when initializing the model ' + newModel.name);
                    console.error(err && err.stack ? err.stack : err);
                    process.exit(1);
                });
            });
        }

        /**
         * @param {Sequelize} sequelize
         * @param {string} fixtureFilePath
         * @param {SequelizeMockingOptions} [options]
         * @returns {Promise.<Sequelize>}
         */

    }, {
        key: 'loadFixtureFile',
        value: function loadFixtureFile(sequelize, fixtureFilePath, options) {
            var logging = !options || options.logging;

            return sequelizeFixtures.loadFile(fixtureFilePath, SequelizeMocking.mapModels(sequelize), { 'log': logging ? null : _.noop }).then(function () {
                return sequelize;
            });
        }

        /**
         * @param sequelize
         * @returns {Object}
         */

    }, {
        key: 'mapModels',
        value: function mapModels(sequelize) {
            var map = {};

            sequelize.modelManager.all.forEach(function (model) {
                map[model.name] = model;
            });

            return map;
        }

        /**
         * @param {Sequelize} mockedSequelize
         * @param {SequelizeMockingOptions} [options]
         * @returns {Promise}
         */

    }, {
        key: 'restore',
        value: function restore(mockedSequelize, options) {
            var logging = !options || options.logging;

            SequelizeMocking.unhookNewModel(mockedSequelize);

            if (mockedSequelize.__originalSequelize) {
                mockedSequelize.__originalSequelize.modelManager.all.forEach(function (model) {
                    model.modelManager = mockedSequelize.__originalSequelize.modelManager;
                });
            }

            logging && console.log('SequelizeMocking - restore the context');
            return mockedSequelize.drop({ 'logging': logging }).then(function () {
                logging && console.log('SequelizeMocking - Context is restored');
            });
        }

        /**
         * @param {Sequelize} mockedSequelize
         */

    }, {
        key: 'unhookNewModel',
        value: function unhookNewModel(mockedSequelize) {
            if (mockedSequelize.__originalSequelize) {
                mockedSequelize.__originalSequelize.removeHook(AFTER_DEFINE_EVENT);
            }
        }
    }]);

    return SequelizeMocking;
}();

module.exports = SequelizeMocking;