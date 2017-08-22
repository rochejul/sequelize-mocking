/**
 * Testing around the @{sequelizeMochingMocha} function to ease testing with Mocha or Jasmine
 *
 * @module test/sequelize-mocking
 * @version 0.1.0
 * @since 0.1.0
 * @author Julien Roche
 */

'use strict';

describe('sequelizeMochingMocha - ', function () {
    const expect = require('chai').expect;
    const sinon = require('sinon');

    const path = require('path');
    const _ = require('lodash');
    const Sequelize = require('sequelize');

    const SequelizeMocking = require('../lib/sequelize-mocking');
    const sequelizeMochingMocha = require('../lib/sequelize-mocking-mocha');

    it('shall exist', function () {
        expect(sequelizeMochingMocha).to.exist;
        expect(_.isPlainObject(sequelizeMochingMocha)).to.be.false;
    });

    it('should be a function', function () {
        expect(sequelizeMochingMocha).to.exist;
        expect(sequelizeMochingMocha).to.be.a('function');
    });

    let sinonSandbox;

    beforeEach(function () {
        sinonSandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sinonSandbox.restore();
    });

    describe('should detect Mocha and Jasmine functions, and ', function () {
        beforeEach(function () {
            global.__beforeEach = global.beforeEach;
            global.beforeEach = null;

            global.__afterEach = global.afterEach;
            global.afterEach = null;
        });

        afterEach(function () {
            global.beforeEach = global.__beforeEach;
            global.afterEach = global.__afterEach;

            delete global.__beforeEach;
            delete global.__afterEach;
        });

        it('should do nothing if only beforeEach is available', function () {
            global.beforeEach = _.noop;

            let spyBefore = sinonSandbox.spy(global, 'beforeEach');

            let sequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            sequelizeMochingMocha(sequelizeInstance, 'a/path/to/fixture');

            expect(spyBefore.called).to.be.false;
        });

        it('should do nothing if only afterEach is available', function () {
            global.afterEach = _.noop;

            let spyAfter = sinonSandbox.spy(global, 'afterEach');

            let sequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            sequelizeMochingMocha(sequelizeInstance, 'a/path/to/fixture');

            expect(spyAfter.called).to.be.false;
        });

        it('should do something if both afterEach and beforeEach functions are available', function () {
            global.beforeEach = _.noop;
            global.afterEach = _.noop;

            let spyBefore = sinonSandbox.spy(global, 'beforeEach');
            let spyAfter = sinonSandbox.spy(global, 'afterEach');

            let sequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            sequelizeMochingMocha(sequelizeInstance, 'a/path/to/fixture');

            expect(spyBefore.called).to.be.true;
            expect(spyBefore.calledOnce).to.be.true;
            expect(spyBefore.calledWith(sinon.match.func)).to.be.true;

            expect(spyAfter.called).to.be.true;
            expect(spyAfter.calledOnce).to.be.true;
            expect(spyAfter.calledWith(sinon.match.func)).to.be.true;
        });
    });

    describe('should on the afterEach method ', function () {
        beforeEach(function () {
            global.__afterEach = global.afterEach;
            global.__beforeEach = global.beforeEach;
            global.beforeEach = _.noop;
        });

        afterEach(function () {
            global.afterEach = global.__afterEach;
            global.beforeEach = global.__beforeEach;

            delete global.__afterEach;
            delete global.__beforeEach;
        });

        it('call the restore method', function () {
            let count = 0;
            let doneFunc = () => count++;

            global.afterEach = function (func) {
                func(doneFunc);
            };

            sinonSandbox.stub(SequelizeMocking, 'restore').callsFake(() => Promise.resolve());

            return new Promise(function(resolve, reject) {
                let sequelizeInstance = new Sequelize('mocked-database', null, null, {
                    'host': 'localhost',
                    'dialect': 'sqlite',
                    'storage': ':memory:'
                });

                sequelizeMochingMocha(sequelizeInstance, 'a/path/to/fixture');

                setTimeout(function () {
                    try {
                        expect(count).equals(1);
                        resolve();

                    } catch (ex) {
                        reject(ex);
                    }
                }, 150);
            });
        });

        it('call the afterEach done parameter even if an error occured', function () {
            let count = 0;
            let doneFunc = () => count++;

            global.afterEach = function (func) {
                func(doneFunc);
            };

            sinonSandbox.stub(SequelizeMocking, 'restore').callsFake(() => Promise.reject());

            return new Promise(function(resolve, reject) {
                let sequelizeInstance = new Sequelize('mocked-database', null, null, {
                    'host': 'localhost',
                    'dialect': 'sqlite',
                    'storage': ':memory:'
                });

                sequelizeMochingMocha(sequelizeInstance, 'a/path/to/fixture');

                setTimeout(function () {
                    try {
                        expect(count).equals(1);
                        resolve();

                    } catch (ex) {
                        reject(ex);
                    }
                }, 150);
            });
        });
    });

    describe('should on the beforeEach method ', function () {
        beforeEach(function () {
            global.__afterEach = global.afterEach;
            global.__beforeEach = global.beforeEach;
            global.afterEach = _.noop;
        });

        afterEach(function () {
            global.afterEach = global.__afterEach;
            global.beforeEach = global.__beforeEach;

            delete global.__afterEach;
            delete global.__beforeEach;
        });

        it('call the create method if no fixture path is set', function () {
            let count = 0;
            let doneFunc = () => count++;

            global.beforeEach = function (func) {
                func(doneFunc);
            };

            sinonSandbox.stub(SequelizeMocking, 'create').callsFake(() => Promise.resolve());

            return new Promise(function(resolve, reject) {
                let sequelizeInstance = new Sequelize('mocked-database', null, null, {
                    'host': 'localhost',
                    'dialect': 'sqlite',
                    'storage': ':memory:'
                });

                sequelizeMochingMocha(sequelizeInstance);

                setTimeout(function () {
                    try {
                        expect(count).equals(1);
                        resolve();

                    } catch (ex) {
                        reject(ex);
                    }
                }, 150);
            });
        });

        it('call the createAndLoadFixtureFile method if a fixture path is set', function () {
            let count = 0;
            let doneFunc = () => count++;

            global.beforeEach = function (func) {
                func(doneFunc);
            };

            sinonSandbox.stub(SequelizeMocking, 'createAndLoadFixtureFile').callsFake(() => Promise.resolve());

            return new Promise(function(resolve, reject) {
                let sequelizeInstance = new Sequelize('mocked-database', null, null, {
                    'host': 'localhost',
                    'dialect': 'sqlite',
                    'storage': ':memory:'
                });

                sequelizeMochingMocha(sequelizeInstance, 'a/path/to/fixture');

                setTimeout(function () {
                    try {
                        expect(count).equals(1);
                        resolve();

                    } catch (ex) {
                        reject(ex);
                    }
                }, 150);
            });
        });

        it('call the beforeEach done parameter even if an error occured', function () {
            let count = 0;
            let doneFunc = () => count++;

            global.beforeEach = function (func) {
                func(doneFunc);
            };

            sinonSandbox.stub(SequelizeMocking, 'createAndLoadFixtureFile').callsFake(() => Promise.reject());

            return new Promise(function(resolve, reject) {
                let sequelizeInstance = new Sequelize('mocked-database', null, null, {
                    'host': 'localhost',
                    'dialect': 'sqlite',
                    'storage': ':memory:'
                });

                sequelizeMochingMocha(sequelizeInstance, 'a/path/to/fixture');

                setTimeout(function () {
                    try {
                        expect(count).equals(1);
                        resolve();

                    } catch (ex) {
                        reject(ex);
                    }
                }, 150);
            });
        });
    });

    describe('should deal with multiple models', function () {
        const sequelize = new Sequelize('mysql://user:xyzzy@localhost:3306/');
        const User = sequelize.define('User', { });
        const OtherObject = sequelize.define('OtherObject', { });

        sequelizeMochingMocha(
            sequelize,
            path.resolve(path.join(__dirname, './user-database.json')),
            { 'logging': false }
        );

        it('', function () {
            expect(User).to.exist;
        });
    });
});
