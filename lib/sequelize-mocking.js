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
const Sequelize = require('sequelize');
const _ = require('lodash');
const sequelizeFixtures = require('sequelize-fixtures');

// Constants and variables
const FAKE_DATABASE_NAME = 'sqlite://test-database';
const AFTER_DEFINE_EVENT = 'afterDefine';
const AFTER_DEFINE_EVENT_NAME = 'sequelizeMockAfterDefine';
const SQLITE_SEQUELIZE_OPTIONS = {
    'dialect': 'sqlite',
    'storage': ':memory:'
};

/**
 * @class SequelizeMockingOptions
 * @property {boolean} [logging=true]
 * @property {Function} [transformFixtureDataFn] Allow an external caller to do some transforms to the data. See https://github.com/domasx2/sequelize-fixtures/commit/cffbfb1c67c8e05d5099b4455b99ac3aadd0089d
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
        let optionsExtended = _.merge(
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
        class TempModel extends Sequelize.Model {
        }

        let newModel = TempModel.init(
            _.merge({ }, model.attributes),
            _.merge({ }, model.options, { 'sequelize': sequelizeInstance, 'modelName': model.name })
        );
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
        SequelizeMocking.modifyConnection(originalSequelize, mockedSequelize);
        SequelizeMocking.modifyModelReferences(originalSequelize, mockedSequelize);
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
     * @param {string | Array.<String>} fixtureFilePath
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

        originalSequelize.addHook(AFTER_DEFINE_EVENT, AFTER_DEFINE_EVENT_NAME, function (newModel) {
            SequelizeMocking
                .modifyModelReference(
                    mockedSequelize,
                    SequelizeMocking.copyModel(mockedSequelize, newModel)
                )
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
     * @param {string | Array.<String>} fixtureFilePath
     * @param {SequelizeMockingOptions} [options]
     * @returns {Promise.<Sequelize>}
     */
    static loadFixtureFile(sequelize, fixtureFilePath, options) {
        let logging = !options || options.logging;
        let transformFixtureDataFn = !options || options.transformFixtureDataFn;
        let loadFixturesOptions = {
            'log': logging ? null : _.noop
        };

        if (_.isFunction(transformFixtureDataFn)) {
            loadFixturesOptions.transformFixtureDataFn = transformFixtureDataFn;
        }

        return sequelizeFixtures[Array.isArray(fixtureFilePath) ? 'loadFiles' : 'loadFile'](fixtureFilePath, SequelizeMocking.mapModels(sequelize), loadFixturesOptions)
            .then(function(){
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
     * @param {Sequelize} originalSequelize
     * @param {Sequelize} newSequelizeToUse
     * @returns {Sequelize} The new Sequelize object
     */
    static modifyConnection(originalSequelize, newSequelizeToUse) {
        originalSequelize.__connectionManager = originalSequelize.connectionManager;
        originalSequelize.connectionManager = newSequelizeToUse.connectionManager;

        originalSequelize.__dialect = originalSequelize.dialect;
        originalSequelize.dialect = newSequelizeToUse.dialect;

        return newSequelizeToUse;
    }

    /**
     * Goal: the instanciate model shall use another instance of @{Sequelize} than the one used to create the model
     *
     * @param {Sequelize} newSequelizeToUse
     * @param {Sequelize.Model} model
     * @returns {Sequelize.Model}
     */
    static modifyModelReference (newSequelizeToUse, model) {
        model.sequelize = newSequelizeToUse;
        return model;
    }

    /**
     * @param {Sequelize} originalSequelize
     * @param {Sequelize} newSequelizeToUse
     * @returns {Sequelize} The new Sequelize object
     */
    static modifyModelReferences(originalSequelize, newSequelizeToUse) {
        originalSequelize.modelManager.all.forEach(function (model) {
            SequelizeMocking.modifyModelReference(newSequelizeToUse, model);
        });

        return newSequelizeToUse;
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
            SequelizeMocking.modifyModelReferences(mockedSequelize, mockedSequelize.__originalSequelize);
        }

        if (mockedSequelize.__dialect && mockedSequelize.__connectionManager) {
            SequelizeMocking.modifyConnection(mockedSequelize, mockedSequelize.__originalSequelize);
        }

        delete mockedSequelize.__originalSequelize;
        delete mockedSequelize.__dialect;
        delete mockedSequelize.__connectionManager;

        logging && console.log('SequelizeMocking - restore the context');
        return mockedSequelize
            .getQueryInterface()
            .dropAllTables({ 'logging': logging })
            .then(function () {
                logging && console.log('SequelizeMocking - Context is restored');
            });
    }

    /**
     * @param {Sequelize} mockedSequelize
     */
    static unhookNewModel(mockedSequelize) {
        if (mockedSequelize.__originalSequelize) {
            mockedSequelize.__originalSequelize.removeHook(AFTER_DEFINE_EVENT, AFTER_DEFINE_EVENT_NAME);
        }
    }
}

module.exports = SequelizeMocking;
