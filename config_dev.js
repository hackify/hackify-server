//*****useage*******
//var config = require('config_' + (process.env.NODE_ENV || 'dev'));

console.log('*** using dev config ***');

exports.port = 4000;
exports.minHostVersion = "0.1.2";
exports.siteSecret = 'joaisduyfoaisduyfo';

exports.gaTrackingId = null;

exports.testRoomName = 'mochatest';

exports.useRedisForFiles = false;
exports.useRedisForOpenFiles = false;
exports.useRedisForSocketIO = false;
exports.useRedisForSessionStore = false;
exports.useRedisForRoomState = false;
exports.useRedisForUserState = false;
exports.useRedisForSessionState = false;
exports.redisHost = '127.0.0.1';
exports.redisPort = 6379;
exports.redisPass = null;
