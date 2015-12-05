'use strict';

var _ = require('lodash');
var wiredep = require('wiredep');

function listFiles() {
  var wiredepOptions = {
    directory: 'bower_components',
    dependencies: true,
    devDependencies: true
  };

  return wiredep(wiredepOptions).js
    .concat([
      'src/*.js',
      'src/*.mock.js',
      'src/*.spec.js'
    ]);
}

module.exports = function(config) {
  config.set({
    files: listFiles(),

    singleRun: true,

    autoWatch: true,

    frameworks: ['jasmine', 'angular-filesort'],

    angularFilesort: {
      whitelist: ['src/!(*.html|*.spec|*.mock).js']
    },

    browsers: ['PhantomJS'],

    plugins: [
      'karma-phantomjs-launcher',
      'karma-angular-filesort',
      'karma-jasmine',
      'karma-coverage'
    ],

    reporters: ['progress', 'coverage'],

    preprocessors: {
      'src/*.js': ['coverage']
    },

    coverageReporter: {
      type: 'lcov',
      dir: 'coverage',
      subdir: '.'
    }
  });
};
