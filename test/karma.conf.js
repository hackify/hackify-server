// Karma configuration
// Generated on Fri Aug 16 2013 09:05:11 GMT+1000 (EST)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['jasmine'],

    plugins: [ 'karma-jasmine', 'karma-firefox-launcher' ],

    // list of files / patterns to load in the browser
    files: [
        'socket.io.js',
        '../public/bower_components/angular/angular.min.js',
        'angular-mocks.js',
        '../public/lib/angular-ui-codemirror/ui-codemirror.js',
        '../public/bower_components/angular-socket-io/socket.js',
        '../public/lib/bootstrap-custom/ui-bootstrap-tpls-0.5.0.js',
        '../public/js/*.js',
        '*.test.js'
        ],




    // list of files to exclude
    exclude: [
    
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Firefox'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
});
};
