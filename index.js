/**
 * Access to the SequelizeMocking lib
 *
 * @module lib/index
 * @exports SequelizeMockingLib
 * @version 1.0.0
 * @since 0.1.0
 * @author Julien Roche
 */

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
