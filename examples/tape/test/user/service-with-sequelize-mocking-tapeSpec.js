/**
 * Test around the @{UserService}
 *
 * @module test/user/service
 */

'use strict';

const sinon = require('sinon');
const path = require('path');
const sequelizeMockingTape = require('sequelize-mocking').sequelizeMockingTape;
let test = require('tape');


// Basic configuration: create a sinon sandbox for testing
let sandbox = null;

test = sequelizeMockingTape.beforeEach(test, function (t) {
    sandbox = sinon.sandbox.create();
    t.end();
});

test = sequelizeMockingTape.afterEach(test, function (t) {
    sandbox && sandbox.restore();
    t.end();
});

const Database = require('../../lib/database');
const UserService = require('../../lib/user/service');
const UserModel = require('../../lib/user/model');

// Load fake data for the users
test = sequelizeMockingTape(
    Database.getInstance(),
    path.resolve(path.join(__dirname, './fake-users-database.json')),
    { 'logging': false },
    test
);

test('User - UserService (classical way) - the service shall exist', function (t) {
    t.true(!!UserService);
    t.end();
});

test('User - UserService (classical way) - and the method findAll shall exist', function (t) {
    t.true(!!UserService.findAll);
    t.end();
});

test('User - UserService (classical way) - and the method findAll shall returns an array of user', function (t) {
    let findAllStub = sandbox.spy(UserModel, 'findAll');

    UserService
        .findAll()
        .then(function (users) {
            t.ok(findAllStub.called);
            t.ok(findAllStub.calledOnce);
            t.ok(findAllStub.calledWith());

            t.deepEqual(users, [{
                'id': 1,
                'firstName': 'John',
                'lastName': 'Doe',
                'age': 25,
                'description': null
            }]);

            t.end();
        })
        .catch(t.end);
});

test('User - UserService (classical way) - and the method find shall exist', function (t) {
    t.true(!!UserService.find);
    t.end();
});

test('User - UserService (classical way) - and the method find shall return an user', function (t) {
    let findByIdStub = sandbox.spy(UserModel, 'findById');

    UserService
        .find(1)
        .then(function (users) {
            t.ok(findByIdStub.called);
            t.ok(findByIdStub.calledOnce);
            t.ok(findByIdStub.calledWith(1));

            t.deepEqual(users, {
                'id': 1,
                'firstName': 'John',
                'lastName': 'Doe',
                'age': 25,
                'description': null
            });

            t.end();
        })
        .catch(t.end);
});

test('User - UserService (classical way) - and the method find shall return null if not found', function (t) {
    return UserService
        .find(-1)
        .then(function (user) {
            t.ok(user === null);
            t.end();
        })
        .catch(t.end);
});
