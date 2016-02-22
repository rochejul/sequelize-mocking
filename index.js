/**
 * Access to the SequelizeMocking lib
 *
 * @module index
 * @exports SequlizeMockingLib
 * @version 0.1.0
 * @since 0.1.0
 * @author Julien Roche
 */

'use strict';

module.exports = {
    'SequelizeMocking': require('./lib/sequelize-mocking'),
    'sequelizeMockingMocha': require('./lib/sequelize-mocking-mocha')
};
