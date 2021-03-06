// Karma configuration
module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
      'tests/test-background.js',
      {pattern: 'app/background/**/*.js', included: false},
      {pattern: 'app/config/**/*.js', included: false},
      {pattern: 'app/lib/**/*.js', included: false},
      {pattern: 'tests/background/**/*.js', included: false},
      {pattern: 'tests/helpers/**/*.js', included: false},
      {pattern: 'vendor/underscore/underscore.js', included: false, watched: false},
      {pattern: 'vendor/bluebird/js/browser/bluebird.js', included: false, watched: false},
      {pattern: 'vendor/configuration-manager/ConfigurationManager.js', included: false, watched: false},
      {pattern: 'vendor/crypto-js-evanvosberg/build/rollups/*.js', included: false, watched: false},
      {pattern: 'vendor/crypto-js-evanvosberg/build/components/*.js', included: false, watched: false}
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'app/background/**/*.js': ['coverage']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'dots'],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],/*'PhantomJS','Chrome'*/

    //browser timeout in ms
    browserNoActivityTimeout: 5 * 60 * 1000,


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
