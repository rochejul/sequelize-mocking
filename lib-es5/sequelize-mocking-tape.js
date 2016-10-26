/**
 * Using SequelizeMocking with tape easily
 *
 * @module lib/sequelize-mocking-tape
 * @exports sequelizeMochingTape
 * @version 0.1.0
 * @since 0.1.0
 * @author Julien Roche
 */

'use strict';

// Imports

var test = require('tape');

var Sequelize = require('sequelize');
var _ = Sequelize.Utils._;
var SequelizeMocking = require('./sequelize-mocking');

/**
 * @method
 * @private
 * @param {Test} test
 * @param {Function} handler
 * @returns {Function}
 */
function beforeEach(test, handler) {
    return function (name, listener) {
        test(name, function (assert) {
            var _end = assert.end;

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
function afterEach(test, handler) {
    return function (name, listener) {
        test(name, function (assert) {
            var _end = assert.end;

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
    var mockedSequelize = null;
    var newTest = null;

    newTest = beforeEach(currentTestInstance ? currentTestInstance : test, function (assert) {
        var createFunc = _.partialRight(fixtureFilePath ? SequelizeMocking.createAndLoadFixtureFile : SequelizeMocking.create, options);

        createFunc(originalSequelize, fixtureFilePath).then(function (sequelizeInstance) {
            mockedSequelize = sequelizeInstance;
            assert.end();
        }).catch(assert.end);
    });

    newTest = afterEach(newTest, function (assert) {
        SequelizeMocking.restore(mockedSequelize, options).then(function () {
            assert.end();
        }).catch(assert.end);
    });

    return newTest;
};

sequelizeMochingTape.beforeEach = beforeEach;
sequelizeMochingTape.afterEach = afterEach;

module.exports = sequelizeMochingTape;