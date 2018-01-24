/**
 * Run the application
 *
 * @module node-sequelize-with-mocks/index
 */

'use strict';

// Imports
const UserService = require('./user/service');
const Database = require('./database');

// Run
console.log('Fetch the users');

Database
    .getInstance()
    .sync()
    .then(() => {
        return UserService.insert({
            'uuid': 'b00f2027-ac48-4ddc-abcd-d5c7f6fe1671',
            'firstName': 'Jane',
            'lastName': 'Doe',
            'age': 24,
            'description': null
        });
    })
    .then(() => {
        return UserService
            .findAll()
            .then(function (users) {
                console.dir(users);
            });
    })
    .catch(function (err) {
        console.error(err && err.stack ? err.stack : err);
    });
