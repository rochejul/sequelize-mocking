/**
 * Testing around the @{sequelizeMochingMocha} function to ease testing with Mocha or Jasmine
 *
 * @module test/sequelize-mocking
 * @version 0.1.0
 * @since 0.1.0
 * @author Julien Roche
 */

'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const path = require('path');
const Sequelize = require('sequelize');
const sequelizeMockingMocha = require('../lib/sequelize-mocking-mocha');

const userModelAttributes = {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: Sequelize.TEXT
};

describe.only('sequelizeMockingMocha - ', function () {
    let sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    const sequelize = new Sequelize('mysql://user:xyzzy@localhost:3306/');
    sequelize.define('User', userModelAttributes);
    sequelize.define('Company', userModelAttributes);

    describe('should load users from one mock file', function () {
        sequelizeMockingMocha(
            sequelize,
            path.resolve(path.join(__dirname, './user-data.json')),
            { 'logging': false }
        );

        it('test that user is loaded from mock file', async function () {
            const user = await sequelize.models.User.findByPk(1);
            expect(user.name).to.eql('mock-user-name');
        });
    });

    describe('should load users from multiple mock file', function () {
        sequelizeMockingMocha(
            sequelize,
            [
                path.resolve(path.join(__dirname, './user-data.json')),
                path.resolve(path.join(__dirname, './company-data.json'))
            ],
            { 'logging': false }
        );

        it('test that user and company are loaded from mock file', async function () {
            const user = await sequelize.models.User.findByPk(1);
            expect(user.name).to.eql('mock-user-name');

            const company = await sequelize.models.Company.findByPk(1);
            expect(company.name).to.eql('mock-company-name');
        });
    });

    describe('should have write access to db', function () {
        sequelizeMockingMocha(
            sequelize,
            [
                path.resolve(path.join(__dirname, './user-data.json')),
                path.resolve(path.join(__dirname, './company-data.json'))
            ],
            { 'logging': false }
        );

        it('test that user and company are created', async function () {
            await sequelize.models.User.create({ id: 2, name: 'created-user' });
            const user = await sequelize.models.User.findByPk(2);
            expect(user.name).to.eql('created-user');

            await sequelize.models.Company.create({ id: 2, name: 'created-company' });
            const company = await sequelize.models.Company.findByPk(2);
            expect(company.name).to.eql('created-company');
        });
    });

    describe('should restore db for each test', function () {
        sequelizeMockingMocha(
            sequelize,
            [
                path.resolve(path.join(__dirname, './user-data.json')),
                path.resolve(path.join(__dirname, './company-data.json'))
            ],
            { 'logging': false }
        );

        for (let index = 0; index < 5; index++) {
            it(`#${index} test that the db is clean and dirty it`, async function () {
                const users = await sequelize.models.User.findAll({ where: {} });
                expect(users.length).to.eql(1);
                expect(users[0].name).to.eql('mock-user-name');

                const companies = await sequelize.models.Company.findAll({ where: {} });
                expect(companies.length).to.eql(1);
                expect(companies[0].name).to.eql('mock-company-name');

                await sequelize.models.User.create({ id: 2, name: 'created-user' });
                await sequelize.models.Company.create({ id: 2, name: 'created-company' });
            });
        }
    });
});
