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

    const path = require('path');
    const EventEmitter = require('events').EventEmitter;
    const _ = require('lodash');

    const Sequelize = require('sequelize');
    const sequelizeFixtures = require('sequelize-fixtures');
    const SequelizeMocking = require('../lib/sequelize-mocking');

    const defaultMaxListeners = EventEmitter.defaultMaxListeners;

    it('shall exist', function () {
        expect(SequelizeMocking).to.exist;
        expect(_.isPlainObject(SequelizeMocking)).to.be.false;
    });

    let sinonSandbox;

    beforeEach(function () {
        sinonSandbox = sinon.sandbox.create();
        EventEmitter.defaultMaxListeners = 100; // Due to an error when we instanciate too many times fastly some dialects, like the MySql one
    });

    afterEach(function () {
        sinonSandbox.restore();
        EventEmitter.defaultMaxListeners = defaultMaxListeners;
    });

    describe('and the method "adaptSequelizeOptions" should ', function () {
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
                    'isolationLevel': null,
                    'logging': console.log,
                    'native': false,
                    'omitNull': false,
                    'operatorsAliases': true,
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
                    'ssl': undefined,
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

    describe('and the method "copyModel" should ', function () {
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
            expect(mockedSequelizeInstance.modelManager.all.length).equals(1);
        });
    });

    describe('and the method "create" should ', function () {
        it('exist', function () {
            expect(SequelizeMocking.create).to.exist;
        });

        it('should use the copyCurrentModels, modifyModelReferences, modifyConnection and hookNewModel methods', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let stubCopy = sinonSandbox.stub(SequelizeMocking, 'copyCurrentModels').callsFake(_.noop);
            let stubModifyModelReferences = sinonSandbox.stub(SequelizeMocking, 'modifyModelReferences').callsFake(_.noop);
            let stubModifyConnection = sinonSandbox.stub(SequelizeMocking, 'modifyConnection').callsFake(_.noop);
            let stubHook = sinonSandbox.stub(SequelizeMocking, 'hookNewModel').callsFake(_.noop);

            SequelizeMocking.create(sequelizeInstance);

            expect(stubCopy.called).to.be.true;
            expect(stubCopy.calledOnce).to.be.true;
            expect(stubCopy.calledWith(sequelizeInstance, sinon.match.instanceOf(Sequelize))).to.be.true;

            expect(stubModifyModelReferences.called).to.be.true;
            expect(stubModifyModelReferences.calledOnce).to.be.true;
            expect(stubModifyModelReferences.calledWith(sequelizeInstance, sinon.match.instanceOf(Sequelize))).to.be.true;

            expect(stubModifyConnection.called).to.be.true;
            expect(stubModifyConnection.calledOnce).to.be.true;
            expect(stubModifyConnection.calledWith(sequelizeInstance, sinon.match.instanceOf(Sequelize))).to.be.true;

            expect(stubHook.called).to.be.true;
            expect(stubHook.calledOnce).to.be.true;
            expect(stubHook.calledWith(sequelizeInstance, sinon.match.instanceOf(Sequelize))).to.be.true;
        });

        it('should return a "mocked" sequelize instance', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let stubCopy = sinonSandbox.stub(SequelizeMocking, 'copyCurrentModels').callsFake(_.noop);
            let stubModify = sinonSandbox.stub(SequelizeMocking, 'modifyModelReferences').callsFake(_.noop);
            let stubHook = sinonSandbox.stub(SequelizeMocking, 'hookNewModel').callsFake(_.noop);

            return SequelizeMocking
                .create(sequelizeInstance)
                .then(function (mockedSequelize) {
                    expect(mockedSequelize).to.be.instanceof(Sequelize);
                    expect(mockedSequelize).not.equals(sequelizeInstance);
                });
        });

        it('should associate onto the "mocked" sequelize instance the original one', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let stubCopy = sinonSandbox.stub(SequelizeMocking, 'copyCurrentModels').callsFake(_.noop);
            let stubModify = sinonSandbox.stub(SequelizeMocking, 'modifyModelReferences').callsFake(_.noop);
            let stubHook = sinonSandbox.stub(SequelizeMocking, 'hookNewModel').callsFake(_.noop);

            return SequelizeMocking
                .create(sequelizeInstance)
                .then(function (mockedSequelize) {
                    expect(mockedSequelize.__originalSequelize).not.to.be.undefined;
                    expect(mockedSequelize.__originalSequelize).to.be.instanceof(Sequelize);
                    expect(mockedSequelize.__originalSequelize).equals(sequelizeInstance);
                });
        });

        it('should pass through the options', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let stubCopy = sinonSandbox.stub(SequelizeMocking, 'copyCurrentModels').callsFake(_.noop);
            let stubModify = sinonSandbox.stub(SequelizeMocking, 'modifyModelReferences').callsFake(_.noop);
            let stubHook = sinonSandbox.stub(SequelizeMocking, 'hookNewModel').callsFake(_.noop);

            return SequelizeMocking
                .create(sequelizeInstance, { 'logging': false })
                .then(function (mockedSequelize) {
                    expect(stubHook.called).to.be.true;
                    expect(stubHook.calledOnce).to.be.true;
                    expect(stubHook.calledWith(sequelizeInstance, sinon.match.instanceOf(Sequelize), { 'logging': false })).to.be.true;
                });
        });
    });

    describe('and the method "createAndLoadFixtureFile" should ', function () {
        it('exist', function () {
            expect(SequelizeMocking.createAndLoadFixtureFile).to.exist;
        });

        it('call the "create" function', function () {
            let stub = sinonSandbox.stub(SequelizeMocking, 'create').callsFake(() => Promise.reject());

            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            SequelizeMocking.createAndLoadFixtureFile(sequelizeInstance, 'a/path', { 'logging': false });
            expect(stub.called).to.be.true;
            expect(stub.calledOnce).to.be.true;
            expect(stub.calledWith(sequelizeInstance, { 'logging': false })).to.be.true;
        });

        it('call the "loadFixtureFile" function for the created mocked sequelize instance', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let mockedSequelizeInstance = new Sequelize('mocked-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let stub = sinonSandbox.stub(SequelizeMocking, 'create').callsFake(() =>  Promise.resolve(mockedSequelizeInstance));
            let stub2 = sinonSandbox.stub(SequelizeMocking, 'loadFixtureFile').callsFake(() => Promise.resolve());

            return SequelizeMocking
                .createAndLoadFixtureFile(sequelizeInstance, 'a/path', { 'logging': false })
                .then(function () {
                    expect(stub2.called).to.be.true;
                    expect(stub2.calledOnce).to.be.true;
                    expect(stub2.calledWith(mockedSequelizeInstance, 'a/path', { 'logging': false })).to.be.true;
                });
        });

        it('return a Promise with the mocked sequelize instance', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let mockedSequelizeInstance = new Sequelize('mocked-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let stub = sinonSandbox.stub(SequelizeMocking, 'create').callsFake(() => Promise.resolve(mockedSequelizeInstance));
            let stub2 = sinonSandbox.stub(SequelizeMocking, 'loadFixtureFile').callsFake(() => Promise.resolve());

            return SequelizeMocking
                .createAndLoadFixtureFile(sequelizeInstance, 'a/path', { 'logging': false })
                .then(function (mockedSequelize) {
                    expect(mockedSequelize).equals(mockedSequelizeInstance);
                });
        });
    });

    describe('and the method "copyCurrentModels" should ', function (){
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


            let spyCopyModel = sinonSandbox.spy(SequelizeMocking, 'copyModel');
            SequelizeMocking.copyCurrentModels(sequelizeInstance, mockedSequelizeInstance);

            spyCopyModel.restore();
            expect(spyCopyModel.called).to.be.true;
            expect(spyCopyModel.calledOnce).to.be.true;
            expect(spyCopyModel.calledWith(mockedSequelizeInstance, MyModel)).to.be.true;
        });
    });

    describe('and the method "hookNewModel" should ', function () {
        it('exist', function () {
            expect(SequelizeMocking.hookNewModel).to.exist;
        });

        it('listen the "afterDefine" event', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let mockedSequelizeInstance = new Sequelize('mocked-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let spy = sinonSandbox.spy(sequelizeInstance, 'addHook');
            SequelizeMocking.hookNewModel(sequelizeInstance, mockedSequelizeInstance);
            expect(spy.called).to.be.true;
            expect(spy.calledOnce).to.be.true;
            expect(spy.calledWith('afterDefine', 'sequelizeMockAfterDefine', sinon.match.func)).to.be.true;
        });

        it('should call "copyModel" when a new model is added', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let mockedSequelizeInstance = new Sequelize('mocked-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let spy = sinonSandbox.spy(SequelizeMocking, 'copyModel');
            SequelizeMocking.hookNewModel(sequelizeInstance, mockedSequelizeInstance);

            let MyModel = sequelizeInstance.define('myModel', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            expect(spy.called).to.be.true;
            expect(spy.calledOnce).to.be.true;
            expect(spy.calledWith(mockedSequelizeInstance, MyModel)).to.be.true;
        });

        it('should call "modifyModelReference" when a new model is added', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let mockedSequelizeInstance = new Sequelize('mocked-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let spy = sinonSandbox.spy(SequelizeMocking, 'modifyModelReference');
            SequelizeMocking.hookNewModel(sequelizeInstance, mockedSequelizeInstance);

            sequelizeInstance.define('myModel', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            expect(spy.called).to.be.true;
            expect(spy.calledOnce).to.be.true;
            expect(spy.calledWith(mockedSequelizeInstance, sinon.match.any)).to.be.true;
        });

        it('should use the "logging" option', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let mockedSequelizeInstance = new Sequelize('mocked-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let fakeObject = {
                'sync': () => Promise.resolve()
            };
            let stub = sinonSandbox.stub(SequelizeMocking, 'modifyModelReference').callsFake(() => fakeObject);
            let spy = sinonSandbox.stub(console, 'log');

            SequelizeMocking.hookNewModel(sequelizeInstance, mockedSequelizeInstance, { 'logging': false });

            sequelizeInstance.define('myModel', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            expect(spy.called).to.be.false;
        });
    });

    describe('and the method "loadFixtureFile" should ', function () {
        it('exist', function () {
            expect(SequelizeMocking.loadFixtureFile).to.exist;
        });

        it('call the map models function', function () {
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

            let stub = sinonSandbox.stub(sequelizeFixtures, 'loadFile').callsFake(() => Promise.resolve());
            let spy = sinonSandbox.spy(SequelizeMocking, 'mapModels');

            SequelizeMocking.loadFixtureFile(sequelizeInstance, '/a/path/for/json/file');
            expect(spy.called).to.be.true;
            expect(spy.calledOnce).to.be.true;
            expect(spy.calledWith(sequelizeInstance)).to.be.true;
        });

        it('load the fixture models file and return into the Promise the sequelize instance', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
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

            return sequelizeInstance
                .sync()
                .then(function () {
                    return SequelizeMocking
                        .loadFixtureFile(sequelizeInstance, path.resolve(path.join(__dirname, './my-model-database.json')));
                })
                .then(function (sequelize) {
                    expect(sequelize).equals(sequelizeInstance);
                });
        });

        it('Should detect load the fixture models files from array and return into the Promise the sequelize instance', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
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

            return sequelizeInstance
                .sync()
                .then(function () {
                    return SequelizeMocking
                        .loadFixtureFile(sequelizeInstance, [
                            path.resolve(path.join(__dirname, './my-model-database.json')),
                            path.resolve(path.join(__dirname, './my-model-1-database.json'))
                        ]);
                })
                .then(function (sequelize) {
                    expect(sequelize).equals(sequelizeInstance);
                });
        });

        it('should not log if the logging option is false', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
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

            let spy = sinonSandbox.spy(sequelizeFixtures, 'loadFile');
            let filePath = path.resolve(path.join(__dirname, './my-model-database.json'));

            return sequelizeInstance
                .sync()
                .then(function () {
                    return SequelizeMocking
                        .loadFixtureFile(sequelizeInstance, filePath, { 'logging': false });
                })
                .then(function () {
                    expect(spy.firstCall.args).deep.equals([
                        filePath,
                        {
                            'myModel': sequelizeInstance.modelManager.all[0]
                        },
                        {
                            'encoding': 'utf8',
                            'log': _.noop
                        }
                    ]);
                });
        });

        it('should allow transform the data if specified', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
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

            let spy = sinonSandbox.spy(sequelizeFixtures, 'loadFile');
            let filePath = path.resolve(path.join(__dirname, './my-model-database.json'));

            function transformFixtureDataFn(data) {
                // Fixtures with negative numbers allow creating data objects
                // relative to the time of the import.
                if(data.createdAt
                    && data.createdAt < 0) {
                    data.createdAt = new Date((new Date()).getTime() + parseFloat(data.createdAt) * 1000 * 60);
                }
                return data;
            }

            return sequelizeInstance
                .sync()
                .then(function () {
                    return SequelizeMocking
                        .loadFixtureFile(sequelizeInstance, filePath, { 'logging': false, 'transformFixtureDataFn': transformFixtureDataFn });
                })
                .then(function () {
                    expect(spy.firstCall.args).deep.equals([
                        filePath,
                        {
                            'myModel': sequelizeInstance.modelManager.all[0]
                        },
                        {
                            'encoding': 'utf8',
                            'log': _.noop,
                            'transformFixtureDataFn': transformFixtureDataFn
                        }
                    ]);
                });
        });
    });

    describe('and the method "mapModels" should ', function () {
        it('exist', function () {
            expect(SequelizeMocking.mapModels).to.exist;
        });

        it('return an empty map if no Sequelize models were defined', function () {
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

            let mapModels = SequelizeMocking.mapModels(sequelizeInstance);
            expect(mapModels).not.to.be.undefined;
            expect(mapModels).to.be.empty;
        });

        it('return a map with the defined Sequelize model', function () {
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

            let mapModels = SequelizeMocking.mapModels(sequelizeInstance);
            expect(mapModels).not.to.be.undefined;
            expect(mapModels).deep.equals({
                'myModel': sequelizeInstance.modelManager.all[0]
            });
        });

        it('return a map with the defined Sequelize models', function () {
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

            sequelizeInstance.define('myModel1', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            sequelizeInstance.define('myModel2', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            let mapModels = SequelizeMocking.mapModels(sequelizeInstance);
            expect(mapModels).not.to.be.undefined;
            expect(mapModels).deep.equals({
                'myModel1': sequelizeInstance.modelManager.all[0],
                'myModel2': sequelizeInstance.modelManager.all[1]
            });
        });
    });

    describe('and the method "modifyConnection" should ', function () {
        it('exist', function () {
            expect(SequelizeMocking.modifyConnection).to.exist;
        });

        it('should override the dialect and the connectionManafer', function () {
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

            let usedDialect = sequelizeInstance.dialect;
            let usedQueryInterface = sequelizeInstance.queryInterface;
            let usedConnectionManager = sequelizeInstance.connectionManager;

            let sequelizeInstance2 = new Sequelize('my-database2', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            SequelizeMocking.modifyConnection(sequelizeInstance, sequelizeInstance2);
            expect(sequelizeInstance.__dialect).to.exist;
            expect(sequelizeInstance.__dialect).equals(usedDialect);

            expect(sequelizeInstance.__queryInterface).to.exist;
            expect(sequelizeInstance.__queryInterface).equals(usedQueryInterface);

            expect(sequelizeInstance.__connectionManager).to.exist;
            expect(sequelizeInstance.__connectionManager).equals(usedConnectionManager);

            expect(sequelizeInstance.dialect === sequelizeInstance2.dialect).to.be.true;
            expect(sequelizeInstance.queryInterface === sequelizeInstance2.queryInterface).to.be.true;
            expect(sequelizeInstance.connectionManager === sequelizeInstance2.connectionManager).to.be.true;
        });
    });

    describe('and the method "modifyModelReference" should ', function () {
        it('exist', function () {
           expect(SequelizeMocking.modifyModelReference).to.exist;
        });

        it('should override the sequelize property of the specified model with the specified sequelize instance', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let sequelizeInstance2 = new Sequelize('my-database2', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
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

            expect(MyModel.sequelize).equals(sequelizeInstance);
            SequelizeMocking.modifyModelReference(sequelizeInstance2, MyModel);
            expect(MyModel.sequelize).equals(sequelizeInstance2);
        });

        it('should override the model manager based on the specified sequelize instance', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            let sequelizeInstance2 = new Sequelize('my-database2', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
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

            expect(MyModel.sequelize).equals(sequelizeInstance);
            SequelizeMocking.modifyModelReference(sequelizeInstance2, MyModel);
            expect(MyModel.sequelize).equals(sequelizeInstance2);
        });
    });

    describe('and the method "modifyModelReferences" should ', function (){
        it('exist', function () {
            expect(SequelizeMocking.modifyModelReferences).to.exist;
        });

        it('override the models of the first sequelize instance', function () {
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

            SequelizeMocking.modifyModelReferences(sequelizeInstance, mockedSequelizeInstance);
            expect(MyModel.sequelize).equals(mockedSequelizeInstance);
        });

        it('use the "modifyModelReference" function', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
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


            let spyCopyModel = sinonSandbox.spy(SequelizeMocking, 'modifyModelReference');
            SequelizeMocking.modifyModelReferences(sequelizeInstance, mockedSequelizeInstance);

            expect(spyCopyModel.called).to.be.true;
            expect(spyCopyModel.calledOnce).to.be.true;
            expect(spyCopyModel.calledWith(mockedSequelizeInstance, MyModel)).to.be.true;
        });
    });

    describe('and the method "restore" should ', function () {
        it('exist', function () {
           expect(SequelizeMocking.restore).to.exist;
        });

        it('should call "unhookNewModel" method', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            let spy = sinonSandbox.spy(SequelizeMocking, 'unhookNewModel');
            SequelizeMocking.restore(mockedSequelizeInstance);
            expect(spy.called).to.be.true;
            expect(spy.calledOnce).to.be.true;
            expect(spy.calledWith(mockedSequelizeInstance)).to.be.true;
        });

        it('should call "modifyModelReferences" method if the sequelize instance is a mocked one', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            let sequelizeInstance = new Sequelize('my-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            mockedSequelizeInstance.__originalSequelize = sequelizeInstance;

            let spy = sinonSandbox.spy(SequelizeMocking, 'modifyModelReferences');
            SequelizeMocking.restore(mockedSequelizeInstance);
            expect(spy.called).to.be.true;
            expect(spy.calledOnce).to.be.true;
            expect(spy.calledWith(mockedSequelizeInstance, sequelizeInstance)).to.be.true;
        });

        it('should call "modifyConnection" method if the sequelize instance is a mocked one', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            let sequelizeInstance = new Sequelize('my-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            mockedSequelizeInstance.__originalSequelize = sequelizeInstance;
            mockedSequelizeInstance.__dialect = sequelizeInstance.dialect;
            mockedSequelizeInstance.__queryInterface = sequelizeInstance.queryInterface;
            mockedSequelizeInstance.__connectionManager = sequelizeInstance.connectionManager;

            let spy = sinonSandbox.spy(SequelizeMocking, 'modifyConnection');
            SequelizeMocking.restore(mockedSequelizeInstance);
            expect(spy.called).to.be.true;
            expect(spy.calledOnce).to.be.true;
            expect(spy.calledWith(mockedSequelizeInstance, sequelizeInstance)).to.be.true;
        });

        it('should remove "__originalSequelize" property', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            mockedSequelizeInstance.__originalSequelize = new Sequelize('my-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            SequelizeMocking.restore(mockedSequelizeInstance);
            expect(mockedSequelizeInstance.__originalSequelize).not.to.exist;
        });

        it('should remove "__dialect" and "__connectionManager" properties', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            mockedSequelizeInstance.__originalSequelize = new Sequelize('my-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            SequelizeMocking.restore(mockedSequelizeInstance);
            expect(mockedSequelizeInstance.__dialect).not.to.exist;
            expect(mockedSequelizeInstance.__connectionManager).not.to.exist;
        });

        it('should flush the mocked sequelize database', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            let spyGetQueryInterface = sinonSandbox.spy(mockedSequelizeInstance, 'getQueryInterface');
            let spyDropAllTables = sinonSandbox.spy(mockedSequelizeInstance.getQueryInterface(), 'dropAllTables');

            return SequelizeMocking
                .restore(mockedSequelizeInstance)
                .then(function () {
                    expect(spyGetQueryInterface.called).to.be.true;
                    expect(spyDropAllTables.called).to.be.true;
                    expect(spyDropAllTables.calledWith({ 'logging': true })).to.be.true;
                });
        });

        it('should use the "logging" option', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            let spyDropAllTables = sinonSandbox.spy(mockedSequelizeInstance.getQueryInterface(), 'dropAllTables');

            return SequelizeMocking
                .restore(mockedSequelizeInstance, { 'logging': false })
                .then(function () {
                    expect(spyDropAllTables.called).to.be.true;
                    expect(spyDropAllTables.calledOnce).to.be.true;
                    expect(spyDropAllTables.calledWith({ 'logging': false })).to.be.true;
                });
        });
    });

    describe('and the method "unhookNewModel" should ', function () {
        it('exist', function () {
            expect(SequelizeMocking.unhookNewModel).to.exist;
        });

        it('do nothing if the sequelize was not mocked', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            expect(function () {
                SequelizeMocking.unhookNewModel(sequelizeInstance);
            }).not.to.throw;
        });

        it('remove the hook on the original sequelize on the mocked sequelize', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            sequelizeInstance.__originalSequelize = {
                'removeHook': function (eventName) {

                }
            };

            let spy = sinonSandbox.spy(sequelizeInstance.__originalSequelize, 'removeHook');

            SequelizeMocking.unhookNewModel(sequelizeInstance);
            expect(spy.called).to.be.true;
            expect(spy.calledOnce).to.be.true;
            expect(spy.calledWith('afterDefine')).to.be.true;
        });
    });
});
