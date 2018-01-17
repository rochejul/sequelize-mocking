/**
 * Test runner over Jasmine
 *
 * @module test/index
 * @author Julien Roche
 */

'use strict';

// Imports
const Jasmine = require('jasmine');

// Configuration
let jasmine = new Jasmine();

jasmine.loadConfig({
    'projectBaseDir': __dirname,
    'spec_dir': 'test/',
    'spec_files': [
        '**/*Spec.js'
    ],
    'random': false
});

jasmine.configureDefaultReporter({ 'showColors': false });

jasmine.onComplete(function(passed) {
    if(passed) {
        console.log('All specs have passed');
    }
    else {
        console.error('At least one spec has failed');
    }
});

// Run the tests !
jasmine.execute();
