'use strict';

// Imports
const Sequelize = require('sequelize');
const sequelizeFixtures = require('sequelize-fixtures');

// Constants and variables
const FAKE_DATABASE_NAME = 'test-database';
const AFTER_DEFINE_EVENT = 'afterDefine';
const SQLITE_SEQUELIZE_OPTIONS = {
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
class SequelizeMocking {
    /**
     * @param {Sequelize} sequelizeInstance
     * @param {SequelizeMockingOptions} [options]
     * @returns {Sequelize} Mocked Sequelize object
     */
    static adaptSequelizeOptions(sequelizeInstance, options) {
        let optionsExtended = Sequelize.Utils._.merge(
            { },
            sequelizeInstance.options,
            SQLITE_SEQUELIZE_OPTIONS,
            { 'logging': options && !options.logging ? false : console.log }
        );

        return optionsExtended;
    }

    /**
     * @param {Sequelize} sequelizeInstance
     * @param {Sequelize.Model} model
     * @returns {Sequelize.Model}
     */
    static copyModel(sequelizeInstance, model) {
        let newModel = new Sequelize.Model(
             model.name,
             Sequelize.Utils._.merge({ }, model.attributes),
             Sequelize.Utils._.merge({ }, model.options)
         );

        newModel = newModel.init(sequelizeInstance.modelManager);
        sequelizeInstance.modelManager.addModel(model);
        return newModel;
    }

    /**
     * @param {Sequelize} originalSequelize
     * @param {Sequelize} mockedSequelize
     * @returns {Sequelize} Mocked Sequelize object
     */
    static copyCurrentModels(originalSequelize, mockedSequelize) {
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
    static create(originalSequelize, options) {
        let logging = !options || options.logging;
        let mockedSequelize = new Sequelize(FAKE_DATABASE_NAME, null, null, SequelizeMocking.adaptSequelizeOptions(originalSequelize, options));

        mockedSequelize.__originalSequelize = originalSequelize;

        SequelizeMocking.copyCurrentModels(originalSequelize, mockedSequelize);
        SequelizeMocking.hookNewModel(originalSequelize, mockedSequelize, options);

        logging && console.log('SequelizeMocking - Mock the context');
        return mockedSequelize
            .sync()
            .then(function () {
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
    static createAndLoadFixtureFile(originalSequelize, fixtureFilePath, options) {
        let logging = !options || options.logging;

        return SequelizeMocking
            .create(originalSequelize, options)
            .then(function (mockedSequelize) {
                return SequelizeMocking
                    .loadFixtureFile(mockedSequelize, fixtureFilePath, options)
                    .then(function () {
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
    static hookNewModel(originalSequelize, mockedSequelize, options) {
        let logging = !options || options.logging;

        originalSequelize.addHook(AFTER_DEFINE_EVENT, function (newModel) {
            SequelizeMocking
                .copyModel(mockedSequelize, newModel)
                .sync({ 'hooks': true })
                .then(function () {
                    logging && console.log(`Model ${newModel.name} was declared into the database`);
                })
                .catch(function (err) {
                    logging && console.error(`An error occured when initializing the model ${newModel.name}`);
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
    static loadFixtureFile(sequelize, fixtureFilePath, options) {
        let logging = !options || options.logging;

        return sequelizeFixtures
            .loadFile(fixtureFilePath, SequelizeMocking.mapModels(sequelize), { 'log': logging ? null : Sequelize.Utils._.noop })
            .then(function () {
                return sequelize;
            });
    }

    /**
     * @param sequelize
     * @returns {Object}
     */
    static mapModels(sequelize) {
        let map = { };

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
    static restore(mockedSequelize, options) {
        let logging = !options || options.logging;

        SequelizeMocking.unhookNewModel(mockedSequelize);

        if (mockedSequelize.__originalSequelize) {
            mockedSequelize.__originalSequelize.modelManager.all.forEach(function (model) {
                model.modelManager = mockedSequelize.__originalSequelize.modelManager;
            });
        }

        logging && console.log('SequelizeMocking - restore the context');
        return mockedSequelize
            .drop({ 'logging': logging })
            .then(function () {
                logging && console.log('SequelizeMocking - Context is restored');
            });
    }

    /**
     * @param {Sequelize} mockedSequelize
     */
    static unhookNewModel(mockedSequelize) {
        if (mockedSequelize.__originalSequelize) {
            mockedSequelize.__originalSequelize.removeHook(AFTER_DEFINE_EVENT);
        }
    }
}

module.exports = SequelizeMocking;
