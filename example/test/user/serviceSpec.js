/**
 * Test around the @{UserService}
 *
 * @module test/user/service
 */

'use strict';

const chai = require('chai');
const sinon = require('sinon');

describe('User - UserService (classical way) - ', function () {
    const UserService = require('../../lib/user/service');
    let UserModel = require('../../lib/user/model');

    // Basic configuration: create a sinon sandbox for testing
    let sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox && sandbox.restore();
    });

    it('the service shall exist', function () {
       chai.expect(UserService).to.exist;
    });

    describe('and the method findAll shall ', function () {
        it('exist', function () {
           chai.expect(UserService.findAll).to.exist;
        });

        it('shall returns an array of user', function () {
            let findAllStub = sandbox.stub(UserModel, 'findAll', function () {
                return Promise.resolve([{
                    'id': 1,
                    'firstName': 'John',
                    'lastName': 'Doe',
                    'age': 25,
                    'description': null
                }]);
            });

            return UserService
                .findAll()
                .then(function (users) {
                    chai.expect(findAllStub.called).to.be.true;
                    chai.expect(findAllStub.calledOnce).to.be.true;
                    chai.expect(findAllStub.calledWith()).to.be.true;

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

        it('shall return an user', function () {
            let findByIdStub = sandbox.stub(UserModel, 'findById', function () {
                return Promise.resolve({
                    'id': 1,
                    'firstName': 'John',
                    'lastName': 'Doe',
                    'age': 25,
                    'description': null
                });
            });

            return UserService
                .find(1)
                .then(function (users) {
                    chai.expect(findByIdStub.called).to.be.true;
                    chai.expect(findByIdStub.calledOnce).to.be.true;
                    chai.expect(findByIdStub.calledWith(1)).to.be.true;

                    chai.expect(users).deep.equals({
                        'id': 1,
                        'firstName': 'John',
                        'lastName': 'Doe',
                        'age': 25,
                        'description': null
                    });
                });
        });

        it('shall return null if not found', function () {
            sandbox.stub(UserModel, 'findById', function () {
                return Promise.resolve(null);
            });

            return UserService
                .find(-1)
                .then(function (user) {
                    chai.expect(user).to.be.null;
                });
        });
    });
});
