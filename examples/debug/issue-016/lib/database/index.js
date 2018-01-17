/**
 * Get the current instance instance of the database and more
 *
 * @module node-sequelize-with-mocks/database/index
 * @exports Database
 */

'use strict';

// Imports
const Sequelize = require('sequelize');
const _DatabaseInstance = require('./_instance');

const useMysql = process.argv.find(arg => arg.startsWith('--mysql'));

/**
 * Database methods
 */
class Database {
    /**
     * @returns {Sequelize}
     */
    static getInstance() {
        let instance = _DatabaseInstance.getCurrentInstance();

        if (!instance) {
            if (useMysql) {
                instance = _DatabaseInstance.setCurrentInstance(new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                    'host': 'localhost',
                    'dialect': 'mysql',
                    'define': {
                        'engine': 'MYISAM',
                        'timestamps': false, // Don't create for each model the 'createdAt' and 'updatedAt' field
                        'paranoid': false // Truly deleted. Not add a 'deletedAt' field
                    },
                    'pool': {
                        'max': 5,
                        'min': 0,
                        'idle': 10000
                    },
                    'query': {
                        'raw': true
                    }
                }));
            } else {
                instance = _DatabaseInstance.setCurrentInstance(new Sequelize('null', 'null', 'null', {
                    'host': 'localhost',
                    'dialect': 'sqlite',
                    'storage': ':memory:',
                    'pool': {
                        'max': 5,
                        'min': 0,
                        'idle': 10000
                    },
                    'query': {
                        'raw': true
                    }
                }));
            }
        }

        return instance;
    }
}

/**
 * @enum {string}
 */
Database.FIELD_TYPE_ENUM = {
    'INTEGER': Sequelize.DataTypes.INTEGER,
    'STRING': Sequelize.DataTypes.STRING,
    'UUID': Sequelize.DataTypes.UUID,
    'TEXT': Sequelize.DataTypes.TEXT
};

module.exports = Database;
