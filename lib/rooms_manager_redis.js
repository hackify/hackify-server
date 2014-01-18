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

/*
HASH for each room...
roomState:myRoom {
  name:'myRoom', 
  moderatorPass:'abc123', 
  readOnly:false, 
  hostVersion: 1.2, 
  hostSocket:'_IX88Vbv82-FGCqjjLcd', 
  authMap = {
    moderator:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':true},
    editor:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':false},
    default:{'editData':false, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': false, 'changeCurrentFile':false, 'changeRole':false}
  }
}
*/

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

module.exports.getAllRoomNames = function(callback){
  var keyIndex = 'roomState:*';
  var list=[];
  client.keys(keyIndex, function(err, keys){
    keys.forEach(function(key){
      list.push(key.split(':')[1]);
    });
    if(callback) callback(err, list);
  });
};

module.exports.exists = function(room, callback){
  var key3 = 'roomState:' + room;
  client.exists(key3, function(err, res){
    if(callback) callback(err, (res===1));
  });
};