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
  winston.info('redis client ready: Files Manager');
});

module.exports.store = function(room, fileName, callback){
  var key2 = 'file:' + room;
  var multi = client.multi();

  multi.
    sadd(key2, fileName).
    exec(function(err, res){
      if(callback) callback(err, res);
    });
};    

module.exports.exists = function(room, fileName, callback){
  var key2 = 'file:' + room;
  client.sismember(key2, fileName, function(err, res){
    if(callback) callback(err, (res===1));
  });
};

module.exports.remove = function(room, fileName, callback){
  var key2 = 'file:' + room;
  client.multi().
    srem(key2, fileName).
    exec(function(err, res){
      if(callback) callback(err, res);
    });
}

module.exports.getAll = function(room, callback){
  var key2 = 'file:' + room;

  client.smembers(key2, function(err, res){
    if(callback) callback(null, res);
  });
};

module.exports.reset = function(room, callback){
  var key2 = 'file:' + room;
  var key3 = 'currentFile:' + room;
  client.multi().
    del(key2).
    del(key3).
    exec(function(err, res){
      if(callback) callback(err, res);
    });
};

module.exports.setCurrentFile = function(room, filename, callback){
  var key3 = 'currentFile:' + room;
  client.set(key3, filename, function(err, res){
    if(callback) callback(err, res);
  });
}

module.exports.getCurrentFile = function(room, callback){
  var key3 = 'currentFile:' + room;
  client.get(key3, function(err, res){
    if(res==0 || res==null || res=="") res="no file";
    if(callback) callback(err, res);
  });
}

