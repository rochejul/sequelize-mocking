/**
 * Define the database model around a @{User}
 *
 * @module node-sequelize-with-mocks/user/model
 * @exports Sequelize.Model
 */

'use strict';

// Imports
const Database = require('../database');

// Model definition

/**
 * @class User
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {number} [age=42]
 * @property {string} [description]
 */

const UserModel = Database
    .getInstance()
    .define('user', {
        'id': {
            'type': Database.FIELD_TYPE_ENUM.INTEGER,
            'autoIncrement': true,
            'primaryKey': true
        },
        'firstName':  {
            'type': Database.FIELD_TYPE_ENUM.STRING,
            'allowNull': false
        },
        'lastName':  {
            'type': Database.FIELD_TYPE_ENUM.STRING,
            'allowNull': false
        },
        'age': {
            'type': Database.FIELD_TYPE_ENUM.INTEGER,
            'defaultValue': 42,
            'validate': {
                'max': 100,
                'min': 18
            }
        },
        'description': Database.FIELD_TYPE_ENUM.TEXT
    });


module.exports = UserModel;

