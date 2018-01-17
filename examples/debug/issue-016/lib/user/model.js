'use strict';

const Database = require('../database');
const uuid = require('uuid/v1');

module.exports = Database
    .getInstance()
    .define(
        'User',
        {
            'uuid': {
                'type': Database.FIELD_TYPE_ENUM.UUID,
                'defaultValue': function() {
                    return uuid();
                },
                'primaryKey': true
            },
            'firstName': {
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
        },
        {
            'timestamps': false
        }
    );
