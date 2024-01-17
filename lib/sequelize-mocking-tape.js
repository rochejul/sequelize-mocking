/**
 * Using SequelizeMocking with tape easily
 *
 * @module lib/sequelize-mocking-tape
 * @exports sequelizeMochingTape
 * @version 0.1.0
 * @since 0.1.0
 * @author Julien Roche
 */

// Imports
const test = require('tape');

const _ = require('lodash');
const SequelizeMocking = require('./sequelize-mocking');

/**
 * @method
 * @private
 * @param {Test} test
 * @param {Function} handler
 * @returns {Function}
 */
function beforeEach(testFunc, handler) {
    return function (name, listener) {
        testFunc(name, function (assert) {
            let _end = assert.end;

            assert.end = function () {
                assert.end = _end;
                listener(assert);
            };

            handler(assert);
        });
    };
}

/**
 * @method
 * @private
 * @param {Test} test
 * @param {Function} handler
 * @returns {Function}
 */
function afterEach(testFunc, handler) {
    return function (name, listener) {
        testFunc(name, function (assert) {
            let _end = assert.end;

            assert.end = function () {
                assert.end = _end;
                handler(assert);
            };

            listener(assert);
        });
    };
}


/**
 * @name sequelizeMochingMocha
 * @param {Sequelize} originalSequelize
 * @param {string} [fixtureFilePath]
 * @param {SequelizeMockingOptions} [options]
 * @param {Test} [currentTestInstance]
 */
function sequelizeMochingTape(originalSequelize, fixtureFilePath, options, currentTestInstance) {
    let mockedSequelize = null;
    let newTest = null;

    newTest = beforeEach(currentTestInstance ? currentTestInstance : test, function (assert) {
        let createFunc = _.partialRight(fixtureFilePath ? SequelizeMocking.createAndLoadFixtureFile : SequelizeMocking.createAndSync, options);

        createFunc(originalSequelize, fixtureFilePath)
            .then(function (sequelizeInstance) {
                mockedSequelize = sequelizeInstance;
                assert.end();
            })
            .catch(assert.end);
    });

    newTest = afterEach(newTest, function (assert) {
        SequelizeMocking
            .restoreAndTropTables(mockedSequelize, options)
            .then(function () {
                assert.end();
            })
            .catch(assert.end);
    });

    return newTest;
}

sequelizeMochingTape.beforeEach = beforeEach;
sequelizeMochingTape.afterEach = afterEach;

module.exports = sequelizeMochingTape;
