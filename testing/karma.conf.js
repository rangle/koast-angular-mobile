'use strict';
module.exports = function (config) {
  config.set({
    basePath: 'src/',
    frameworks: ['mocha', 'chai', 'sinon'],
    files: [],
    exclude: [],
    reporters: ['progress'],
    port: 9999,
    colors: true,
    logLevel: config.LOG_DEBUG,
    autoWatch: false,
    browsers: ['Chrome'], // Alternatively: 'PhantomJS'
    captureTimeout: 6000,
    singleRun: true
  });
};
