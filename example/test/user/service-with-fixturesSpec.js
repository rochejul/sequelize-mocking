/**
 * Test around the @{UserService}
 *
 * @module test/user/service
 */

'use strict';

const chai = require('chai');
const sinon = require('sinon');
const path = require('path');
const Sequelize = require('sequelize');
const sequelizeFixtures = require('sequelize-fixtures');

describe('User - UserService (using sequelize-fixtures) - ', function () {
    const DatabaseInstance = require('../../lib/database/_instance');
    const UserService = require('../../lib/user/service');
    const UserModel = require('../../lib/user/model');

    // Basic configuration: create a sinon sandbox for testing
    let sandbox = null;
    let realSequelizeInstance = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox && sandbox.restore();
    });

    // Load fake data for the users
    beforeEach(function (done) {
        realSequelizeInstance = DatabaseInstance.getCurrentInstance();

        let sequelizeInstance = new Sequelize('test-database', null, null, {
            'host': 'localhost',
            'dialect': 'sqlite',
            'storage': ':memory:',
            'define': {
                'timestamps': false, // Don't create for each model the 'createdAt' and 'updatedAt' field
                'paranoid': false // Truly deleted. Not add a 'deletedAt' field
            },
            'pool': {
                'max': 5,
                'min': 0,
                'idle': 10000
            }
        });

        sandbox.stub(DatabaseInstance, 'getCurrentInstance', function () {
            return sequelizeInstance;
        });

        realSequelizeInstance.modelManager.all.forEach(function (model) {
            model.init(sequelizeInstance.modelManager);
            sequelizeInstance.modelManager.addModel(model);
            model.sequelize = sequelizeInstance;
        });

        sequelizeInstance
            .sync()
            .then(function () {
                done();
            })
            .catch(done);
    });

    beforeEach(function (done) {
        sequelizeFixtures
            .loadFile(path.resolve(path.join(__dirname, './fake-users-database.json')), { 'user': UserModel })
            .then(function () {
                done();
            })
            .catch(done);
    });

    afterEach(function () {
        realSequelizeInstance.modelManager.all.forEach(function (model) {
            model.init(realSequelizeInstance.modelManager);
            model.sequelize = realSequelizeInstance;
        });
    });

    it('the service shall exist', function () {
       chai.expect(UserService).to.exist;
    });

    //describe('and the method findAll shall ', function () {
    //    it('exist', function () {
    //        chai.expect(UserService.findAll).to.exist;
    //    });
    //
    //    it('shall returns an array of user', function () {
    //        return UserService
    //            .findAll()
    //            .then(function (users) {
    //                chai.expect(users).deep.equals([{
    //                    'id': 1,
    //                    'firstName': 'John',
    //                    'lastName': 'Doe',
    //                    'age': 25,
    //                    'description': null
    //                }]);
    //            });
    //    });
    //});
    //
    //describe('and the method find shall ', function () {
    //    it('exist', function () {
    //        chai.expect(UserService.find).to.exist;
    //    });
    //
    //    it('shall return an user if we can', function () {
    //        let findByIdSpy = sandbox.spy(UserModel, 'findById');
    //
    //        return UserService
    //            .find(1)
    //            .then(function (user) {
    //                chai.expect(findByIdSpy.called).to.be.true;
    //                chai.expect(findByIdSpy.calledOnce).to.be.true;
    //                chai.expect(findByIdSpy.calledWith(1)).to.be.true;
    //
    //                chai.expect(user).deep.equals({
    //                    'id': 1,
    //                    'firstName': 'John',
    //                    'lastName': 'Doe',
    //                    'age': 25,
    //                    'description': null
    //                });
    //            });
    //    });
    //
    //    it('shall return null if not found', function () {
    //        return UserService
    //            .find(-1)
    //            .then(function (user) {
    //                chai.expect(user).to.be.null;
    //            });
    //    });
    //});
});
