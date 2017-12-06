/**
 * Internal module to deal with database intances
 *
 * @module node-sequelize-with-mocks/database/_instance
 * @private
 * @exports _DatabaseInstance
 */

'use strict';

// Constants & variables

/**
 * @type {Sequelize}
 * @private
 */
let _instance = null;

/**
 * Database instance management
 * @private
 */
class _DatabaseInstance {
    /**
     * @returns {Sequelize}
     */
    static getCurrentInstance() {
        return _instance;
    }

    /**
     * @param {Sequelize} instance
     * @returns {Sequelize}
     */
    static setCurrentInstance(instance) {
        _instance = instance;
        return _instance;
    }
}

module.exports = _DatabaseInstance;
