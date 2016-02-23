/**
 * Using SequelizeMocking with mocha easily
 *
 * @module lib/sequelize-mocking-mocha
 * @exports Function
 * @version 0.1.0
 * @since 0.1.0
 * @author Julien Roche
 */

'use strict';

// Imports

var Sequelize = require('sequelize');
var _ = Sequelize.Utils._;
var SequelizeMocking = require('./sequelize-mocking');

/**
 * @param {Sequelize} originalSequelize
 * @param {string} [fixtureFilePath]
 * @param {SequelizeMockingOptions} [options]
 */
module.exports = function (originalSequelize, fixtureFilePath, options) {
    var beforeEach = global.beforeEach ? global.beforeEach : null;
    var afterEach = global.afterEach ? global.afterEach : null;

    if (beforeEach && afterEach) {
        (function () {
            var mockedSequelize = null;

            beforeEach(function (done) {
                var createFunc = _.partialRight(fixtureFilePath ? SequelizeMocking.createAndLoadFixtureFile : SequelizeMocking.create, options);

                createFunc(originalSequelize, fixtureFilePath).then(function (sequelizeInstance) {
                    mockedSequelize = sequelizeInstance;
                    done();
                }).catch(done);
            });

            afterEach(function (done) {
                SequelizeMocking.restore(mockedSequelize, options).then(function () {
                    done();
                }).catch(done);
            });
        })();
    }
};