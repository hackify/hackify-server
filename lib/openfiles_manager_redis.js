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
  winston.info('redis client ready');
});

module.exports.store = function(room, fileName, body, isDirty, callback){
  var key1 = 'openFile:' + room + ":" + fileName;
  var key2 = 'openFile:' + room;
  var multi = client.multi();
  if(isDirty===true || isDirty===false){
    multi.hset(key1, 'isDirty', isDirty);
  }

  multi.
    hset(key1, 'body', body).  
    sadd(key2, fileName).
    exec(function(err, res){
      if(callback) callback(err, res);
    });
};    

module.exports.exists = function(room, fileName, callback){
  var key2 = 'openFile:' + room;
  client.sismember(key2, fileName, function(err, res){
    if(callback) callback(err, (res===1));
  });
};

module.exports.isDirty = function(room, fileName, callback){
  var key1 = 'openFile:' + room + ":" + fileName;
  client.hget(key1, 'isDirty', function(err, res){
    if(callback) callback(err, (res==='true'));
  })
};

module.exports.setIsDirty = function(room, fileName, isDirty, callback){
  var key1 = 'openFile:' + room + ":" + fileName;
  client.hget(key1, 'isDirty', function(err, res){
    var hasChanged = !(res===isDirty);
    client.hset(key1, 'isDirty', isDirty, function(err, res){
      if(!err){
        if(callback) callback(null, hasChanged);
      }else{
        if(callback) callback(err, null);
      }      
    });
  });
};

module.exports.get = function(room, fileName, callback){
  var key1 = 'openFile:' + room + ":" + fileName;
  client.hget(key1, 'body', function(err, res){
    if(err){
      if(callback) callback(err, null);
    }else{
      if(callback) callback(null, res);
    }
  })
};

module.exports.remove = function(room, fileName, callback){
  var key1 = 'openFile:' + room + ":" + fileName;
  var key2 = 'openFile:' + room;
  client.multi().
    srem(key2, fileName).
    del(key1).
    exec(function(err, res){
      if(callback) callback(err, res);
    });
}

module.exports.getAll = function(room, callback){
  var key2 = 'openFile:' + room;

  var list = [];
  var multi = client.multi();

  client.smembers(key2, function(err, res){
    for(var i = 0; i<res.length; i++){
      var key1 = 'openFile:' + room + ":" + res[i];
      multi.hgetall(key1);
    }

    multi.exec(function(err, res2){
      // for(var i = res2.length-1; i>=0; --i){
      for(var i = 0; i<res2.length; i++){
        list.push({fileName:res[i], body:res2[i].body, isDirty:(res2[i].isDirty==='true')});
      }
      if(callback) callback(null, list);
    });

  });
};

module.exports.reset = function(room, callback){
  var key2 = 'openFile:' + room;
  var multi = client.multi();

  client.smembers(key2, function(err, res){
    if(res){
      for(var i = 0; i<res.length; i++){
        var key1 = 'openFile:' + room + ":" + res[i];
        multi.del(key1);
      }
    }
    multi.del(key2).exec(function(err, res){if(callback) callback(err, res)});
  });
};