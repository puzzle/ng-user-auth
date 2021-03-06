module.exports = function (config) {

  let testWebpackConfig = require('./webpack.test.js');

  let configuration = {

    // base path that will be used to resolve all patterns (e.g. files, exclude)
    basePath: '../',

    /*
     * Frameworks to use
     *
     * available frameworks: https://npmjs.org/browse/keyword/karma-adapter
     */
    frameworks: ['jasmine'],

    // list of files to exclude
    exclude: [],

    client: {
      captureConsole: false
    },

    /*
     * list of files / patterns to load in the browser
     *
     * we are building the test environment in ./spec-bundle.js
     */
    files: [
      { pattern: './config/spec-bundle.js', watched: false },
    ],

    /*
     * By default all assets are served at http://localhost:[PORT]/base/
     */
    proxies: {},

    /*
     * preprocess matching files before serving them to the browser
     * available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
     */
    preprocessors: { './config/spec-bundle.js': ['coverage', 'webpack', 'sourcemap'] },

    // Webpack Config at ./webpack.test.js
    webpack: testWebpackConfig,

    // Webpack please don't spam the console when running in karma!
    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i.e.
      noInfo: false,
      // and use stats to turn off verbose output
      stats: {
        // options i.e.
        chunks: true
      }
    },

    /*
     * test results reporter to use
     *
     * possible values: 'dots', 'progress'
     * available reporters: https://npmjs.org/browse/keyword/karma-reporter
     */
    reporters: ['progress', 'coverage', 'remap-coverage'],

    coverageReporter: {
      type: 'in-memory'
    },
    remapCoverageReporter: {
      'text-summary': null,
      'text-lcov': './coverage/lcov.info',
      html: './coverage/html'
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    /*
     * level of logging
     * possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
     */
    logLevel: config.LOG_WARN,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    /*
     * start these browsers
     * available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
     */
    browsers: [
      'PhantomJS'
    ],

    /*
     * Continuous Integration mode
     * if true, Karma captures browsers, runs the tests and exits
     */
    singleRun: true
  };

  config.set(configuration);
};
