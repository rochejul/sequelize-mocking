/**
 * Service around @{User}
 *
 * @module node-sequelize-with-mocks/user/service
 * @exports UserService
 */

'use strict';

// Imports
const UserModel = require('./model');
const Database = require('../database');


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

    /**
     * @param {User} user
     * @returns {Promise.<User>}
     */
    static insert(user) {
        return Database
            .getInstance()
            .transaction(t => UserModel.create(user, { 'transaction': t }));
    }
}

module.exports = UserService;

