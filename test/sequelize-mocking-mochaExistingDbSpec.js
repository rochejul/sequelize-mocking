const expect = require('chai').expect;
const sqlite3 = require('sqlite3');

const path = require('path');
const Sequelize = require('sequelize');
const fs = require('fs');

const SequelizeMocking = require('../lib/sequelize-mocking');
const { promisify } = require('util');
const testFolder = ['.sequelize-mocking-temp', 'test'];
const userModelAttributes = {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: Sequelize.TEXT
};

describe('sequelizeMockingMocha Existing DB - ', function () {
    beforeEach(() => {
        fs.rmSync('.sequelize-mocking-temp', { recursive: true, force: true });
    });

    afterEach(() => {
        fs.rmSync('.sequelize-mocking-temp', { recursive: true, force: true });
    });

    it('test that main temp folder was created', () => {
        SequelizeMocking.verifyOrCreateTempDbFolder();
        expect(fs.existsSync('.sequelize-mocking-temp')).to.be.true;
    });

    it('test that namespace folder was created', () => {
        SequelizeMocking.verifyOrCreateTempDbFolder();
        SequelizeMocking.createCleanFolder('test');
        expect(fs.existsSync(path.join(...testFolder))).to.be.true;
    });

    it('test that backup is created', () => {
        SequelizeMocking.verifyOrCreateTempDbFolder();
        SequelizeMocking.createCleanFolder('test');
        fs.writeFileSync(path.join(...testFolder, 'database.sqlite'), '<TEST_DATA>');
        SequelizeMocking.createBackup('test');
        expect(fs.existsSync(path.join(...testFolder, 'backup.sqlite'))).to.be.true;
        expect(fs.readFileSync(path.join(...testFolder, 'backup.sqlite'), { encoding: 'utf8' })).to.eql('<TEST_DATA>');
    });

    it('test that backup is restored', () => {
        SequelizeMocking.verifyOrCreateTempDbFolder();
        SequelizeMocking.createCleanFolder('test');
        fs.writeFileSync(path.join(...testFolder, 'database.sqlite'), '<TEST_DATA>');
        SequelizeMocking.createBackup('test');
        fs.writeFileSync(path.join(...testFolder, 'database.sqlite'), '<TEST_DATA_CHANGED>');
        expect(fs.readFileSync(path.join(...testFolder, 'database.sqlite'), { encoding: 'utf8' })).to.eql('<TEST_DATA_CHANGED>');
        SequelizeMocking.restoreBackup('test');
        expect(fs.readFileSync(path.join(...testFolder, 'database.sqlite'), { encoding: 'utf8' })).to.eql('<TEST_DATA>');
    });

    it('test setupDatabase', async () => {
        // Create real db
        const originalSequelize = new Sequelize('sqlite::memory:');
        originalSequelize.define('User', userModelAttributes);

        // Setup mock
        const mockedSequelize = await SequelizeMocking.setupDatabase(originalSequelize,
            path.join(__dirname, 'user-data.json'),
            { logging: true }, 'test');

        // Verify that db files exist
        expect(fs.existsSync(path.join(...testFolder, 'backup.sqlite'))).to.be.true;
        expect(fs.existsSync(path.join(...testFolder, 'database.sqlite'))).to.be.true;

        // Verify that data from mock file is loaded
        const user1 = await originalSequelize.models.User.findByPk(1);
        expect(user1.name).to.eql('mock-user-name');

        await originalSequelize.models.User.create({
            id: 1001,
            name: 'test-add'
        });
        const user2 = await originalSequelize.models.User.findByPk(1001);
        expect(user2.name).to.eql('test-add');

        await mockedSequelize.close();

        const db = new sqlite3.Database(path.join(...testFolder, 'database.sqlite'));
        const res = await promisify(db.get.bind(db))('select name from users where id = 1001');
        expect(res.name).to.eql('test-add');
    });

    it('test setupDatabase with keepDatabaseBetweenRuns=true and no db', async () => {
        // Create real db
        const originalSequelize = new Sequelize('sqlite::memory:');
        originalSequelize.define('User', userModelAttributes);

        // Setup mock
        const mockedSequelize = await SequelizeMocking.setupDatabase(originalSequelize,
            path.join(__dirname, 'user-data.json'),
            { logging: true, keepDatabaseBetweenRuns: true }, 'test');

        // Verify that db files exist
        expect(fs.existsSync(path.join(...testFolder, 'backup.sqlite'))).to.be.true;
        expect(fs.existsSync(path.join(...testFolder, 'database.sqlite'))).to.be.true;

        // Verify that data from mock file is loaded
        const user1 = await originalSequelize.models.User.findByPk(1);
        expect(user1.name).to.eql('mock-user-name');

        await originalSequelize.models.User.create({
            id: 1001,
            name: 'test-add'
        });
        const user2 = await originalSequelize.models.User.findByPk(1001);
        expect(user2.name).to.eql('test-add');

        await mockedSequelize.close();

        const db = new sqlite3.Database(path.join(...testFolder, 'database.sqlite'));
        const res = await promisify(db.get.bind(db))('select name from users where id = 1001');
        expect(res.name).to.eql('test-add');
    });

    it('test setupDatabase with keepDatabaseBetweenRuns=true and existing db', async () => {
        const namespace = 'test-keepDatabaseBetweenRuns';
        // Create real db
        const originalSequelize = new Sequelize('sqlite::memory:');
        originalSequelize.define('User', userModelAttributes);

        SequelizeMocking.verifyOrCreateTempDbFolder();
        SequelizeMocking.createCleanFolder(namespace);

        // Create a database with different data
        const db = new sqlite3.Database(path.join('.sequelize-mocking-temp', namespace, 'backup.sqlite'));
        await promisify(db.run.bind(db))('CREATE TABLE IF NOT EXISTS `Users` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `name` TEXT, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);');
        await promisify(db.run.bind(db))('INSERT INTO `Users` (`id`,`name`,`createdAt`,`updatedAt`) VALUES (2, "test-existing-name", "01-01-2024", "01-01-2024")');

        // Setup mock
        const mockedSequelize = await SequelizeMocking.setupDatabase(originalSequelize,
            path.join(__dirname, 'user-data.json'),
            { logging: true, keepDatabaseBetweenRuns: true }, namespace);

        // Verify that db files exist
        expect(fs.existsSync(path.join('.sequelize-mocking-temp', namespace, 'backup.sqlite'))).to.be.true;
        expect(fs.existsSync(path.join('.sequelize-mocking-temp', namespace, 'database.sqlite'))).to.be.true;

        // Verify that data from existing backup database was loaded
        const user1 = await originalSequelize.models.User.findByPk(2);
        expect(user1.name).to.eql('test-existing-name');

        await mockedSequelize.close();
    });

    it('test cleanupDatabase', async () => {
        // Create real db
        const originalSequelize = new Sequelize('sqlite::memory:');
        originalSequelize.define('User', userModelAttributes);
        await originalSequelize.sync();

        // Setup mock
        const mockedSequelize = await SequelizeMocking.setupDatabase(originalSequelize,
            path.join(__dirname, 'user-data.json'),
            { logging: true }, 'test');

        // Cleanup mock
        await SequelizeMocking.cleanupDatabase(mockedSequelize, { logging: true }, 'test');

        // Verify that db files where cleaned
        expect(fs.existsSync(path.join(...testFolder, 'backup.sqlite'))).to.be.false;
        expect(fs.existsSync(path.join(...testFolder, 'database.sqlite'))).to.be.false;

        // Verify that data from mock file is not loaded
        const user1 = await originalSequelize.models.User.findByPk(1);
        expect(user1).to.be.null;

        // Check that the existing db still works
        await originalSequelize.models.User.create({
            id: 1001,
            name: 'test-add'
        });
        const user2 = await originalSequelize.models.User.findByPk(1001);
        expect(user2.name).to.eql('test-add');
    });

    it('test cleanupDatabase with keepDatabaseBetweenRuns=true', async () => {
        // Create real db
        const originalSequelize = new Sequelize('sqlite::memory:');
        originalSequelize.define('User', userModelAttributes);
        await originalSequelize.sync();

        // Setup mock
        const mockedSequelize = await SequelizeMocking.setupDatabase(originalSequelize,
            path.join(__dirname, 'user-data.json'),
            { logging: true }, 'test');

        // Cleanup mock
        await SequelizeMocking.cleanupDatabase(mockedSequelize, { logging: true, keepDatabaseBetweenRuns: true }, 'test');

        // Verify that db files where cleaned
        expect(fs.existsSync(path.join(...testFolder, 'backup.sqlite'))).to.be.true;
        expect(fs.existsSync(path.join(...testFolder, 'database.sqlite'))).to.be.false;

        // Verify that data from mock file is not loaded
        const user1 = await originalSequelize.models.User.findByPk(1);
        expect(user1).to.be.null;

        // Check that the existing db still works
        await originalSequelize.models.User.create({
            id: 1001,
            name: 'test-add'
        });
        const user2 = await originalSequelize.models.User.findByPk(1001);
        expect(user2.name).to.eql('test-add');
    });


    it('test restoreFromBackup', async () => {
        // Create real db
        const originalSequelize = new Sequelize('sqlite::memory:');
        originalSequelize.define('User', userModelAttributes);
        await originalSequelize.sync();

        // Setup mock
        let mockedSequelize = await SequelizeMocking.setupDatabase(originalSequelize,
            path.join(__dirname, 'user-data.json'),
            { logging: true }, 'test');

        // Verify that data from mock file is loaded
        let user1 = await originalSequelize.models.User.findByPk(1);
        expect(user1.name).to.eql('mock-user-name');

        // Create some data
        await originalSequelize.models.User.create({
            id: 1001,
            name: 'test-add'
        });
        let user2 = await originalSequelize.models.User.findByPk(1001);
        expect(user2.name).to.eql('test-add');
        await originalSequelize.models.User.destroy({ where: { id: 1 } });

        await SequelizeMocking.restoreFromBackup(mockedSequelize, { logging: true }, 'test');

        // Verify that data from mock file is loaded
        user1 = await originalSequelize.models.User.findByPk(1);
        expect(user1.name).to.eql('mock-user-name');

        // Verify that the data was cleaned;
        user2 = await originalSequelize.models.User.findByPk(1001);
        expect(user2).to.be.null;
    });
});
