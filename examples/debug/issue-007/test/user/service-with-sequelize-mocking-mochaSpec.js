/**
 * Test around the @{UserService}
 *
 * @module test/user/service
 */

'use strict';

const chai = require('chai');
const sinon = require('sinon');
const path = require('path');
const sequelizeMockingMocha = require('sequelize-mocking').sequelizeMockingMocha;

describe('User - UserService (using sequelizeMockingMocha) - ', function () {
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
    sequelizeMockingMocha(
        Database.getInstance(),
        path.resolve(path.join(__dirname, './fake-users-database.json')),
        { 'logging': false }
    );

    it('the service shall exist', function () {
       chai.expect(UserService).to.exist;
    });

    describe('and the method login shall ', function () {
        it('exist', function () {
            chai.expect(UserService.login).to.exist;
        });

        it('return an user if we can', function () {
            let findByIdSpy = sandbox.spy(UserModel, 'findById');

            return UserService
                .login('roche.jul@gmail.com', 'myPassword')
                .then(function (user) {
                    chai.expect(findByIdSpy.called).to.be.true;
                    chai.expect(findByIdSpy.calledOnce).to.be.true;
                    chai.expect(findByIdSpy.calledWith('roche.jul@gmail.com', 'myPassword')).to.be.true;

                    chai.expect(user).deep.equals({
                        'email': 'roche.jul@gmail.com',
                        'password': '5a5fd34f5b3ab16aff01a05dbf570d737e3edec3',
                        'salt': 'abcdef'
                    });
                })
                .catch(function (err) {
                    throw err;
                });
        });

        it('return null if not found', function () {
            return UserService
                .login('roche.jul@gmail.com', 'badPassword')
                .then(function (user) {
                    chai.expect(user).to.be.null;
                });
        });
    });
});
