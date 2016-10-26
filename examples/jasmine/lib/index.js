/**
 * Run the application
 *
 * @module node-sequelize-with-mocks/index
 */

'use strict';

// Imports
const UserService = require('./user/service');

// Run
console.log('Fetch the users');

UserService
    .findAll()
    .then(function (users) {
        console.dir(users);
    })
    .catch(function (err) {
        console.error(err && err.stack ?  err.stack : err);
    });
