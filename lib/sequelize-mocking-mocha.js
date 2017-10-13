/**
 * Using SequelizeMocking with mocha easily
 *
 * @module lib/sequelize-mocking-mocha
 * @exports sequelizeMochingMocha
 * @version 0.1.0
 * @since 0.1.0
 * @author Julien Roche
 */

'use strict';

// Imports
const _ = require('lodash');
const Sequelize = require('sequelize');
const SequelizeMocking = require('./sequelize-mocking');

/**
 * @name sequelizeMochingMocha
 * @param {Sequelize} originalSequelize
 * @param {string} [fixtureFilePath]
 * @param {SequelizeMockingOptions} [options]
 */
module.exports = function (originalSequelize, fixtureFilePath, options) {
    let beforeEach = global.beforeEach ? global.beforeEach : null;
    let afterEach = global.afterEach ? global.afterEach : null;

    if (beforeEach && afterEach) {
        let mockedSequelize = null;

        beforeEach(function (done) {

            let createFunc = fixtureFilePath ? SequelizeMocking.createAndLoadFixtureFile : SequelizeMocking.create;

            createFunc(originalSequelize, fixtureFilePath, options)
                .then(function (sequelizeInstance) {
                    mockedSequelize = sequelizeInstance;
                    done();
                })
                .catch(done);
        });

        afterEach(function (done) {
            SequelizeMocking
                .restore(mockedSequelize, options)
                .then(function () {
                    done();
                })
                .catch(done);
        });
    }
};
