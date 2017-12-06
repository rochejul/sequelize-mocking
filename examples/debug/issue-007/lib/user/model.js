'use strict';

const Database = require('../database');

module.exports = Database
    .getInstance()
    .define(
        'User',
        {
            'email': {
                'type': Database.FIELD_TYPE_ENUM.STRING,
                'unique': true
            },
            'password': Database.FIELD_TYPE_ENUM.STRING,
            'salt': Database.FIELD_TYPE_ENUM.STRING
        }
    );
