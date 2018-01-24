/**
 * Test around the @{UserService}
 *
 * @module test/user/service
 */

'use strict';

const chai = require('chai');
const sinon = require('sinon');
const path = require('path');
const sequelizeMockingJasmine = require('sequelize-mocking').sequelizeMockingJasmine;

describe('User - UserService (using sequelizeMockingJasmine) - ', function () {
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
    sequelizeMockingJasmine(
        Database.getInstance(),
        path.resolve(path.join(__dirname, './fake-users-database.json')),
        { 'logging': false }
    );

    it('the service shall exist', function () {
       chai.expect(UserService).to.exist;
    });

    describe('and the method findAll shall ', function () {
        it('exist', function () {
           chai.expect(UserService.findAll).to.exist;
        });

        it('shall returns an array of user', function (done) {
            UserService
                .findAll()
                .then(function (users) {
                    chai.expect(users).deep.equals([{
                        'uuid': 'f64f2940-fae4-11e7-8c5f-ef356f279131',
                        'firstName': 'John',
                        'lastName': 'Doe',
                        'age': 25,
                        'description': null
                    }]);
                    done();
                })
                .catch(done.fail);
        });
    });

    describe('and the method insert shall ', function () {
        it('exist', function () {
            chai.expect(UserService.insert).to.exist;
        });

        it('shall insert a new user', function (done) {
            let findByIdSpy = sandbox.spy(UserModel, 'findById');

            UserService
                .insert({
                    'uuid': '9e126f71-a6b4-4ad2-b370-37f9f3971005',
                    'firstName': 'Smith',
                    'lastName': 'Wesson',
                    'age': 42,
                    'description': null
                })
                .then(() => UserService.findAll())
                .then(function (users) {
                    chai.expect(users.length).equals(2);
                    chai.expect(users).deep.equals([
                        {
                            'uuid': 'f64f2940-fae4-11e7-8c5f-ef356f279131',
                            'firstName': 'John',
                            'lastName': 'Doe',
                            'age': 25,
                            'description': null
                        },
                        {
                            'uuid': '9e126f71-a6b4-4ad2-b370-37f9f3971005',
                            'firstName': 'Smith',
                            'lastName': 'Wesson',
                            'age': 42,
                            'description': null
                        }
                    ]);
                    done();
                })
                .catch(done.fail);
        });
    });

    describe('and the method find shall ', function () {
        it('exist', function () {
            chai.expect(UserService.find).to.exist;
        });

        it('shall return an user if we can', function (done) {
            let findByIdSpy = sandbox.spy(UserModel, 'findById');

            UserService
                .find('f64f2940-fae4-11e7-8c5f-ef356f279131')
                .then(function (user) {
                    chai.expect(findByIdSpy.called).to.be.true;
                    chai.expect(findByIdSpy.calledOnce).to.be.true;
                    chai.expect(findByIdSpy.calledWith('f64f2940-fae4-11e7-8c5f-ef356f279131')).to.be.true;

                    chai.expect(user).deep.equals({
                        'uuid': 'f64f2940-fae4-11e7-8c5f-ef356f279131',
                        'firstName': 'John',
                        'lastName': 'Doe',
                        'age': 25,
                        'description': null
                    });
                    done();
                })
                .catch(done.fail);
        });

        it('shall return null if not found', function (done) {
            UserService
                .find('f64f2940-fae4-11e7-8c5f-ef356f279135')
                .then(function (user) {
                    chai.expect(user).to.be.null;
                    done();
                })
                .catch(done.fail);
        });
    });
});
