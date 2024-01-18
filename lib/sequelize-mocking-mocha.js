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

/**
 * @name sequelizeMochingMocha
 * @param {Sequelize} originalSequelize
 * @param {string} [fixtureFilePath]
 * @param {SequelizeMockingOptions} [options]
 */
module.exports = function (originalSequelize, fixtureFilePath, options) {
    const before = global.before ? global.before : null;
    const after = global.after ? global.after : null;
    const beforeEach = global.beforeEach ? global.beforeEach : null;

    if (before && after && beforeEach) {
        let mockedSequelize = null;
        let namespace = options && options.namespace ? options.namespace : uuidv4();

        before(async function () {
            mockedSequelize = await SequelizeMocking.setupDatabase(originalSequelize, fixtureFilePath, options, namespace);
        });

        beforeEach(async function () {
            mockedSequelize = await SequelizeMocking.restoreFromBackup(mockedSequelize, options, namespace);
        });

        after(async function () {
            mockedSequelize = await SequelizeMocking.cleanupDatabase(mockedSequelize, options, namespace);
        });
    }
};
