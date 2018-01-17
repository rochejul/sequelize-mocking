/**
 * Service around @{User}
 *
 * @module node-sequelize-with-mocks/user/service
 * @exports UserService
 */

'use strict';

// Imports
const UserModel = require('./model');


class UserService {
    /**
     * @returns {Promise.<User[]>}
     */
    static findAll() {
        return UserModel.findAll({
            'raw': true
        });
    }

    /**
     * @param {number} userId
     * @returns {Promise.<User>}
     */
    static find(userId) {
        return UserModel.findById(userId);
    }
}

module.exports = UserService;

