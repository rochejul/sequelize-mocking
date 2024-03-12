/**
 * Using SequelizeMocking with mocha easily
 *
 * @module lib/sequelize-mocking-mocha
 * @exports sequelizeMochingMocha
 * @version 0.1.0
 * @since 0.1.0
 * @author Julien Roche
 */

// Imports
const { v4: uuidv4 } = require('uuid');
const SequelizeMocking = require('./sequelize-mocking');
let truncatableSequelize = null;

/**
 * @name sequelizeMockingMocha
 * @param {Sequelize} originalSequelize
 * @param {string} [fixtureFilePath]
 * @param {SequelizeMockingOptions} [options]
 */
module.exports = async function (originalSequelize, fixtureFilePath, options) {
    if (options.initTruncatable) {
        truncatableSequelize = await SequelizeMocking.createAndSync(originalSequelize, options);
    } else if (originalSequelize.options.isTruncatable) {
        let beforeEach = global.beforeEach ? global.beforeEach : null;
        let afterEach = global.afterEach ? global.afterEach : null;

        if (beforeEach && afterEach) {
            beforeEach(async function () {
                if (fixtureFilePath && fixtureFilePath.length) {
                    await SequelizeMocking.loadFixtureFile(truncatableSequelize, fixtureFilePath, options);
                }
            });

            afterEach(async function () {
                await SequelizeMocking.truncateAllTables(truncatableSequelize, options);
            });
        }
    } else {
        const before = global.before ? global.before : null;
        const after = global.after ? global.after : null;
        const beforeEach = global.beforeEach ? global.beforeEach : null;

        if (before && after && beforeEach) {
            let restorableSequelize = null;
            const keepDatabaseBetweenRuns = options && options.keepDatabaseBetweenRuns;

            if (keepDatabaseBetweenRuns && !options.namespace) {
                throw new Error('got keepDatabaseBetweenRuns:true but didn\'t get a namespace. ' +
                    'This will cause sequelizeMockingMocha to create a new database every time. Please set some uniq namespace for this mock.');
            }

            const namespace = options && options.namespace ? options.namespace : uuidv4();

            if (keepDatabaseBetweenRuns) {
                console.warn(`You are running this mock with keepDatabaseBetweenRuns:true and namespace:${namespace}. This will cause sequelizeMockingMocha` +
                    ` to load the data from '.sequelize-mocking-temp/${namespace}/backup.sqlite' and ignore the mock files. Make sure to delete the '.sequelize-mocking-temp' folder` +
                    ' after changing the mock data.');
            }

            before(async function () {
                restorableSequelize = await SequelizeMocking.setupDatabase(originalSequelize, fixtureFilePath, options, namespace);
            });

            beforeEach(async function () {
                restorableSequelize = await SequelizeMocking.restoreFromBackup(restorableSequelize, options, namespace);
            });

            after(async function () {
                restorableSequelize = await SequelizeMocking.cleanupDatabase(restorableSequelize, options, namespace);
            });
        }
    }
};
