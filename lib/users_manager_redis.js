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
  winston.info('redis client ready user manager');
});


/*
HASH for each client...
user:1234 {room:'myroom', userId:'bob', userInfo:'{JSON}', role:'default', requestedRole:'admin'}

SET to create an index of clientId's for each room
user:room1 [1234, 5678, 5555]
*/

module.exports.create = function(room, clientId, userId, userInfo, role, requestedRole, callback){
  var key1 = 'user:' + clientId;
  var key2 = 'user:room:' + room;

  client.multi().
    hset(key1, 'room', room).  
    hset(key1, 'userId', userId).  
    hset(key1, 'userInfo', JSON.stringify(userInfo)).  
    hset(key1, 'role', role).  
    hset(key1, 'requestedRole', requestedRole).  
    sadd(key2, clientId).
    exec(function(err, res){
      if(callback) callback(err, res);
    });
};    

module.exports.getRoom = function(clientId, callback){
  var key1 = 'user:' + clientId;
  client.hget(key1, 'room', function(err, res){
    if(callback) callback(err, res);
  })
};

module.exports.setRoom = function(clientId, room, callback){
  var key1 = 'user:' + clientId;
  client.hset(key1, 'room', room, function(err, res){
    if(callback) callback(err, res);    
  });
};

module.exports.getUserId = function(clientId, callback){
  var key1 = 'user:' + clientId;
  client.hget(key1, 'userId', function(err, res){
    if(callback) callback(err, res);
  })
};

module.exports.setUserId = function(clientId, userId, callback){
  var key1 = 'user:' + clientId;
  client.hset(key1, 'userId', userId, function(err, res){
    if(callback) callback(err, res);    
  });
};

module.exports.getUserInfo = function(clientId, callback){
  var key1 = 'user:' + clientId;
  client.hget(key1, 'userInfo', function(err, res){
    if(callback) callback(err, JSON.parse(res));
  })
};

module.exports.setUserInfo = function(clientId, userInfo, callback){
  var key1 = 'user:' + clientId;
  client.hset(key1, 'userInfo', JSON.stringify(userInfo), function(err, res){
    if(callback) callback(err, res);    
  });
};

module.exports.getRole = function(clientId, callback){
  var key1 = 'user:' + clientId;
  client.hget(key1, 'role', function(err, res){
    if(callback) callback(err, res);
  })
};

module.exports.setRole = function(clientId, role, callback){
  var key1 = 'user:' + clientId;
  client.hset(key1, 'role', role, function(err, res){
    if(callback) callback(err, res);    
  });
};

module.exports.getRequestedRole = function(clientId, callback){
  var key1 = 'user:' + clientId;
  client.hget(key1, 'requestedRole', function(err, res){
    if(callback) callback(err, res);
  })
};

module.exports.setRequestedRole = function(clientId, requestedRole, callback){
  var key1 = 'user:' + clientId;
  client.hset(key1, 'requestedRole', requestedRole, function(err, res){
    if(callback) callback(err, res);    
  });
};

module.exports.remove = function(clientId, callback){
  var key1 = 'user:' + clientId;
  
  client.hget(key1, 'room', function(err, room){
    var key2 = 'user:room:' + room;
    client.multi().
      srem(key2, clientId).
      del(key1).
      exec(function(err, res){
        if(callback) callback(err, res);
      });    
  });
}

module.exports.get = function(clientId, callback){
  var key1 = 'user:' + clientId;
  client.hgetall(key1, function(err, res){
    if(callback) callback(err, getUserFromResult(clientId, res));
  })
};

module.exports.getAllInRoom = function(room, callback){
  var key2 = 'user:room:' + room;

  var list = [];
  var multi = client.multi();

  client.smembers(key2, function(err, res){
    for(var i = 0; i<res.length; i++){
      var key1 = 'user:' + res[i];
      multi.hgetall(key1);
    }

    multi.exec(function(err, res2){
      // for(var i = res2.length-1; i>=0; --i){
      for(var i = 0; i<res2.length; i++){
        list.push(getUserFromResult(res[i], res2[i]));
      }
      if(callback) callback(null, list);
    });

  });
};

module.exports.countMembersInRoom = function(room, callback){
    var key2 = 'user:room:' + room;
    client.scard(key2, function(err, res){
      if(callback) callback(err, res);
    });
};


var getUserFromResult = function(clientId, bagHash){
  if(bagHash){
    return {clientId:clientId, roomName:bagHash.room, userId:bagHash.userId, userInfo:JSON.parse(bagHash.userInfo), role:bagHash.role, requestedRole:bagHash.requestedRole};
  }else{
    console.log("null user requested clientId", clientId);
    return {clientId:clientId, roomName:"", userId:"", userInfo:{}, role:"", requestedRole:""};    
  }
};

module.exports.resetRoom = function(room, callback){
  var key2 = 'user:room:' + room;
  var multi = client.multi();

  client.smembers(key2, function(err, res){
    if(res){
      for(var i = 0; i<res.length; i++){
        var key1 = 'user:' + res[i];
        multi.del(key1);
      }
    }
    multi.del(key2).exec(function(err, res){if(callback) callback(err, res)});
  });
};