/**
 * Access to the SequelizeMocking lib
 *
 * @module lib/index
 * @exports SequelizeMockingLib
 * @version 1.0.0
 * @since 0.1.0
 * @author Julien Roche
 */

'use strict';

Object.defineProperty(module.exports, 'SequelizeMocking', {
    'get': function() {
        return require('./lib/sequelize-mocking');
    }
});

Object.defineProperty(module.exports, 'sequelizeMockingMocha', {
    'get': function() {
        return require('./lib/sequelize-mocking-mocha');
    }
});

Object.defineProperty(module.exports, 'sequelizeMockingJasmine', {
    'get': function() {
        return require('./lib/sequelize-mocking-jasmine');
    }
});

Object.defineProperty(module.exports, 'sequelizeMockingTape', {
    'get': function() {
        return require('./lib/sequelize-mocking-tape');
    }
});
