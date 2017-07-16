/**
 * Test around the @{UserService}
 *
 * @module test/user/service
 */

'use strict';

const sinon = require('sinon');
let test = require('tape');

/**
 * @method
 * @private
 * @param {Test} test
 * @param {Function} handler
 * @returns {Function}
 */
function beforeEach(test, handler) {
    return function (name, listener) {
        test(name, function (assert) {
            let _end = assert.end;

            assert.end = function () {
                assert.end = _end;
                listener(assert);
            };

            handler(assert);
        });
    }
}

/**
 * @method
 * @private
 * @param {Test} test
 * @param {Function} handler
 * @returns {Function}
 */
function afterEach(test, handler) {
    return function (name, listener) {
        test(name, function (assert) {
            let _end = assert.end;

            assert.end = function () {
                assert.end = _end;
                handler(assert);
            };

            listener(assert);
        });
    };
}

// Basic configuration: create a sinon sandbox for testing
let sandbox = null;

test = beforeEach(test, function (t) {
    sandbox = sinon.sandbox.create();
    t.end();
});

test = afterEach(test, function (t) {
    sandbox && sandbox.restore();
    t.end();
});

const UserService = require('../../lib/user/service');
let UserModel = require('../../lib/user/model');

test('User - UserService (classical way) - the service shall exist', function (t) {
    t.true(!!UserService);
    t.end();
});

test('User - UserService (classical way) - and the method findAll shall exist', function (t) {
    t.true(!!UserService.findAll);
    t.end();
});

test('User - UserService (classical way) - and the method findAll shall returns an array of user', function (t) {
    let findAllStub = sandbox.stub(UserModel, 'findAll', function () {
        return Promise.resolve([{
            'id': 1,
            'firstName': 'John',
            'lastName': 'Doe',
            'age': 25,
            'description': null
        }]);
    });

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
    let findByIdStub = sandbox.stub(UserModel, 'findById', function () {
        return Promise.resolve({
            'id': 1,
            'firstName': 'John',
            'lastName': 'Doe',
            'age': 25,
            'description': null
        });
    });

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
    sandbox.stub(UserModel, 'findById', function () {
        return Promise.resolve(null);
    });

    return UserService
        .find(-1)
        .then(function (user) {
            t.ok(user === null);
            t.end();
        })
        .catch(t.end);
});
