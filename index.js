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

/**
 * @class SequelizeMockingLib
 * @property {SequelizeMocking} SequelizeMocking
 * @property {sequelizeMockingMocha} sequelizeMockingMocha
 */

if (semver.lt(process.version, '4.0.0')) {
    // Use ES5 modules
    module.exports = {
        'SequelizeMocking': require('./lib-es5/sequelize-mocking'),
        'sequelizeMockingMocha': require('./lib-es5/sequelize-mocking-mocha')
    };

} else {
    // Use ES6 modules
    module.exports = {
        'SequelizeMocking': require('./lib/sequelize-mocking'),
        'sequelizeMockingMocha': require('./lib/sequelize-mocking-mocha')
    };
}
