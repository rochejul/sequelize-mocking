/**
 * Access to the SequelizeMocking lib
 *
 * @module lib/index
 * @exports SequelizeMockingLib
 * @version 0.1.0
 * @since 0.1.0
 * @author Julien Roche
 */

'use strict';

// Nota Bene: do not use es6 syntax here to deal with a fallbacl
var semver = require('semver');
var basePath;

/**
 * @class SequelizeMockingLib
 * @property {SequelizeMocking} SequelizeMocking
 * @property {sequelizeMockingMocha} sequelizeMockingMocha
 */

if (semver.lt(process.version, '4.0.0')) {
    // Use ES5 modules
    basePath = './lib-es5';

} else {
    // Use ES6 modules
    basePath = './lib';
}

Object.defineProperty(module.exports, 'SequelizeMocking', {
    'get': function() {
        return require(basePath + '/sequelize-mocking');
    }
});

Object.defineProperty(module.exports, 'sequelizeMockingMocha', {
    'get': function() {
        return require(basePath + '/sequelize-mocking-mocha');
    }
});

Object.defineProperty(module.exports, 'sequelizeMockingJasmine', {
    'get': function() {
        return require(basePath + '/sequelize-mocking-jasmine');
    }
});

Object.defineProperty(module.exports, 'sequelizeMockingTape', {
    'get': function() {
        return require(basePath + '/sequelize-mocking-tape');
    }
});
