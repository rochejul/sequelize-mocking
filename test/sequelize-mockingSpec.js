/**
 * Testing around @{SequelizeMocking}
 *
 * @module test/sequelize-mocking
 * @version 0.1.0
 * @since 0.1.0
 * @author Julien Roche
 */

'use strict';

describe('SequelizeMocking - ', function () {
    const expect = require('chai').expect;
    const _ = require('lodash');
    const Sequelize = require('sequelize');
    const SequelizeMocking = require('../lib/sequelize-mocking');

    it('shall exist', function () {
        expect(SequelizeMocking).to.exist;
        expect(SequelizeMocking).not.to.be.empty;
    });

    describe('the method "adaptSequelizeOptions" should ', function () {
        it('exist', function () {
            expect(SequelizeMocking.adaptSequelizeOptions).to.exist;
        });

        let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
            'host': 'localhost',
            'dialect': 'mysql',
            'define': {
                'engine': 'MYISAM',
                'timestamps': false,
                'paranoid': false
            },
            'pool': {
                'max': 5,
                'min': 0,
                'idle': 10000
            }
        });
        let sequelizeInstanceOptions = _.cloneDeep(sequelizeInstance.options);

        it('returns an extended sequelize configuration', function () {
            expect(SequelizeMocking.adaptSequelizeOptions(sequelizeInstance))
                .deep
                .equals({
                    'benchmark': false,
                    'databaseVersion': 0,
                    'define': {
                        'engine': 'MYISAM',
                        'paranoid': false,
                        'timestamps': false
                    },
                    'dialect': 'sqlite',
                    'dialectModulePath': null,
                    'hooks': {},
                    'host': 'localhost',
                    'isolationLevel': 'REPEATABLE READ',
                    'logging': console.log,
                    'native': false,
                    'omitNull': false,
                    'pool': {
                        'idle': 10000,
                        'max': 5,
                        'min': 0,
                    },
                    'protocol': 'tcp',
                    'query': {},
                    'quoteIdentifiers': true,
                    'replication': false,
                    'retry': {
                        'match': [
                            'SQLITE_BUSY: database is locked'
                        ],
                        'max': 5
                    },
                    'storage': ':memory:',
                    'sync': {},
                    'timezone': '+00:00',
                    'transactionType': 'DEFERRED',
                    'typeValidation': false
                });
        });

        it('does not affect the options of the sequelize instance passed as parameter', function () {
            let adaptedSequelizeOptions = SequelizeMocking.adaptSequelizeOptions(sequelizeInstance);
            expect(sequelizeInstance.options).deep.equals(sequelizeInstanceOptions);
        });

        describe('returns, based on options, ', function () {
            it('a sequelize options which allows logging', function () {
                let adaptedSequelizeOptions = SequelizeMocking.adaptSequelizeOptions(sequelizeInstance, { 'logging': true });
                expect(adaptedSequelizeOptions.logging).equals(console.log);
            });

            it('a sequelize options which disables logging', function () {
                let adaptedSequelizeOptions = SequelizeMocking.adaptSequelizeOptions(sequelizeInstance, { 'logging': false });
                expect(adaptedSequelizeOptions.logging).to.be.false;
            });
        });
    });
});
