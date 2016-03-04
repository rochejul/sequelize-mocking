/**
 * Test around the @{UserService}
 *
 * @module test/user/service
 */

'use strict';

const chai = require('chai');
const sinon = require('sinon');
const path = require('path');
const SequelizeMocking = require('sequelize-mocking').SequelizeMocking;

describe('User - UserService (using SequelizeMocking) - ', function () {
    const Database = require('../../lib/database');
    const UserService = require('../../lib/user/service');
    const UserModel = require('../../lib/user/model');

    // Basic configuration: create a sinon sandbox for testing
    let sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox && sandbox.restore();
    });

    // Load fake data for the users
    let sequelizeInstance = null;

    beforeEach(function (done) {
        SequelizeMocking
            .createAndLoadFixtureFile(Database.getInstance(), path.resolve(path.join(__dirname, './fake-users-database.json')))
            .then(function (mockedSequelizeInstance) {
                sequelizeInstance = mockedSequelizeInstance;
                done();
            })
            .catch(done);
    });

    afterEach(function (done) {
        SequelizeMocking
            .restore(sequelizeInstance)
            .then(function () {
                done();
            })
            .catch(done);
    });

    it('the service shall exist', function () {
       chai.expect(UserService).to.exist;
    });

    describe('and the method findAll shall ', function () {
        it('exist', function () {
           chai.expect(UserService.findAll).to.exist;
        });

        it('shall returns an array of user', function () {
            return UserService
                .findAll()
                .then(function (users) {
                    chai.expect(users).deep.equals([{
                        'id': 1,
                        'firstName': 'John',
                        'lastName': 'Doe',
                        'age': 25,
                        'description': null
                    }]);
                });
        });
    });

    describe('and the method find shall ', function () {
        it('exist', function () {
            chai.expect(UserService.find).to.exist;
        });

        it('shall return an user if we can', function () {
            let findByIdSpy = sandbox.spy(UserModel, 'findById');

            return UserService
                .find(1)
                .then(function (user) {
                    chai.expect(findByIdSpy.called).to.be.true;
                    chai.expect(findByIdSpy.calledOnce).to.be.true;
                    chai.expect(findByIdSpy.calledWith(1)).to.be.true;

                    chai.expect(user).deep.equals({
                        'id': 1,
                        'firstName': 'John',
                        'lastName': 'Doe',
                        'age': 25,
                        'description': null
                    });
                });
        });

        it('shall return null if not found', function () {
            return UserService
                .find(-1)
                .then(function (user) {
                    chai.expect(user).to.be.null;
                });
        });
    });
});
