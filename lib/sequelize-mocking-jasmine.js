/**
 * Using SequelizeMocking with jasmine easily
 *
 * @module lib/sequelize-mocking-jasmine
 * @exports sequelizeMochingJasmine
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
            let createFunc = _.partialRight(fixtureFilePath ? SequelizeMocking.createAndLoadFixtureFile : SequelizeMocking.create, options);

            createFunc(originalSequelize, fixtureFilePath)
                .then(function (sequelizeInstance) {
                    mockedSequelize = sequelizeInstance;
                    done();
                })
                .catch(done.fail);
        });

        afterEach(function (done) {
            SequelizeMocking
                .restore(mockedSequelize, options)
                .then(function () {
                    done();
                })
                .catch(done.fail);
        });
    }
};
