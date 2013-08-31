//*****useage*******
//var config = require('config_' + (process.env.NODE_ENV || 'dev'));

console.log('*** using dev config ***');

exports.port = 4000;
exports.callbackURI = 'http://localhost:4000/auth/github/callback'
exports.minHostVersion = "0.1.2";
exports.siteSecret = 'joaisduyfoaisduyfo';

exports.gitHubClientId = 'ce87dc982c42245ee0e7';
exports.gitHubClientSecret = '69d0368eac9e5dc7be3cecf7f3fe53c172139664';

exports.gaTrackingId = null;
