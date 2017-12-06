/**
 * Service around @{User}
 *
 * @module node-sequelize-with-mocks/user/service
 * @exports UserService
 */

'use strict';

// Imports
const UserModel = require('./model');
const Sequelize = require('Sequelize');

class UserService {
    /**
     * @param {string} email
     * @param {string} password
     * @returns {Promise.<User>}
     */
    static login(email, password) {
        return UserModel
            .findOne({
                'where': {
                    email,
                    'password': Sequelize.fn('sha1', Sequelize.fn('concat', password, Sequelize.col('salt')))
                }
            });
    }
}

module.exports = UserService;

