var winston = require('winston'),
    redis = require("redis"),
    config = require('../config_' + (process.env.NODE_ENV || 'dev')),
    client = redis.createClient(config.redisPort, config.redisHost);


if(config.redisPass){
  client.auth(config.redisPass, function (err) {
    if (err) {
      winston.info('error authorising redis:%s', err);
    }else{
      winston.info('redis auth ok');
    }
  });
}

client.on('ready', function () {
  winston.info('redis client ready: Rooms Manager');
}); 

module.exports.set = function(room, roomState, callback){
  var key3 = 'roomState:' + room;
  client.set(key3, JSON.stringify(roomState), function(err, res){
    if(callback) callback(err, res);
  });
};

module.exports.get = function(room, callback){
  var key3 = 'roomState:' + room;
  client.get(key3, function(err, res){
    if(callback) callback(err, JSON.parse(res));
  });
};

module.exports.reset = function(room, callback){
  var key3 = 'roomState:' + room;
  client.del(key3, function(err, res){
    if(callback) callback(err, res);
  });
};
