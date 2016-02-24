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
    const sinon = require('sinon');

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

    describe('the method "copyModel" should ', function () {
        it('exist', function () {
            expect(SequelizeMocking.copyModel).to.exist;
        });

        it('duplicate a model with the same options', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
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

            let MyModel = sequelizeInstance.define('myModel', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            let DuplicatedMyModel = SequelizeMocking.copyModel(mockedSequelizeInstance, MyModel);
            expect(DuplicatedMyModel.name).equals(MyModel.name);
            expect(_.omit(DuplicatedMyModel.options, 'sequelize')).deep.equals(_.omit(MyModel.options, 'sequelize'));
        });

        it('duplicate a model without keeping the references', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
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

            let MyModel = sequelizeInstance.define('myModel', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            let DuplicatedMyModel = SequelizeMocking.copyModel(mockedSequelizeInstance, MyModel);
            expect(DuplicatedMyModel).not.equals(MyModel);
            expect(DuplicatedMyModel.options).not.equals(MyModel.options);
            expect(DuplicatedMyModel.attributes).not.equals(MyModel.attributes);
        });

        it('duplicate a model with upgrading the modelManager of the Sequelize instance', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
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

            let MyModel = sequelizeInstance.define('myModel', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            expect(mockedSequelizeInstance.modelManager.all.length).equals(0);

            let DuplicatedMyModel = SequelizeMocking.copyModel(mockedSequelizeInstance, MyModel);
            expect(MyModel.options.sequelize).equals(sequelizeInstance);
            expect(DuplicatedMyModel.options.sequelize).equals(mockedSequelizeInstance);

            expect(sequelizeInstance.modelManager.all.length).equals(1);
            expect(sequelizeInstance.modelManager).equals(MyModel.modelManager);
            expect(sequelizeInstance.modelManager.all[0]).equals(MyModel);

            expect(mockedSequelizeInstance.modelManager.all.length).equals(1);
            expect(mockedSequelizeInstance.modelManager).equals(DuplicatedMyModel.modelManager);
            expect(mockedSequelizeInstance.modelManager.all[0]).equals(DuplicatedMyModel);
        });
    });

    describe('the method "copyCurrentModels" should ', function (){
        it('exist', function () {
            expect(SequelizeMocking.copyCurrentModels).to.exist;
        });

        it('copy the models of the first sequelize instance into the second one', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
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

            sequelizeInstance.define('myModel', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            expect(sequelizeInstance.modelManager.all.length).equals(1);
            expect(mockedSequelizeInstance.modelManager.all.length).equals(0);

            SequelizeMocking.copyCurrentModels(sequelizeInstance, mockedSequelizeInstance);

            expect(sequelizeInstance.modelManager.all.length).equals(1);
            expect(mockedSequelizeInstance.modelManager.all.length).equals(1);
            expect(sequelizeInstance.modelManager.all[0]).not.equals(mockedSequelizeInstance.modelManager.all[0]);
        });

        it('use the "copyModel" function', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
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

            let MyModel = sequelizeInstance.define('myModel', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });


            let spyCopyModel = sinon.spy(SequelizeMocking, 'copyModel');
            SequelizeMocking.copyCurrentModels(sequelizeInstance, mockedSequelizeInstance);

            spyCopyModel.restore();
            expect(spyCopyModel.called).to.be.true;
            expect(spyCopyModel.calledOnce).to.be.true;
            expect(spyCopyModel.calledWith(mockedSequelizeInstance, MyModel)).to.be.true;
        });
    });
});
