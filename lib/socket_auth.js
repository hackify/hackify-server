var async = require('async'),
    winston = require('winston'),
    config = require('../config_' + (process.env.NODE_ENV || 'dev')),
    rm = require('./rooms_manager_' + ((config.useRedisForRoomState)?'redis' :'hash'));

module.exports.checkedOperation = function(socket, operationName, opCallback, errCallback){
  async.parallel([
      function(callback){
        socket.get('room', function(err, roomName){ callback(err, roomName); });         
      },
      function(callback){
        socket.get('userId', function(err, userId){ callback(err, userId); });         
      },
      function(callback){
        socket.get('role', function(err, role){ callback(err, role); });         
      }
  ],
  function(err, results){
    var roomName = results[0],
        userId = results[1],
        role = results[2];

    if(!err){
      rm.get(roomName, function(err, roomState){
        if(!err && roomState){
          if( role==='host' || (roomState.authMap[role] && roomState.authMap[role][operationName]===true) ){
            opCallback(roomName, roomState, userId, role);
          }else{
            handleError(socket, errCallback, 'you are not authorised to perform the ' + operationName + ' operation');       
          }
        } else {
          handleError(socket, errCallback, 'room ' + roomName + ' no longer exists');
        }
      });
    } else {
      winston.error('problem determining socket info', {err:err});
    }
  });
};

module.exports.getSocketInfo = function(socket, operationName, opCallback, errCallback){
  async.parallel([
      function(callback){
        socket.get('room', function(err, roomName){ callback(err, roomName); });         
      },
      function(callback){
        socket.get('userId', function(err, userId){ callback(err, userId); });         
      },
      function(callback){
        socket.get('role', function(err, role){ callback(err, role); });         
      }
  ],
  function(err, results){
    var roomName = results[0],
        userId = results[1],
        role = results[2];

    if(!err){
      rm.get(roomName, function(err, roomState){
        if(!err && roomState){
          opCallback(roomName, roomState, userId, role);
        } else {
          handleError(socket, errCallback, 'room ' + roomName + ' no longer exists');
        }
      });
    } else {
      winston.error('problem determining socket info', {err:err});
    }
  });
};



var handleError = function(socket, errCallback, errmsg){
  if(errCallback){
    errCallback(errmsg);
  }else{
    socket.emit('newChatMessage', errmsg, 'hackify');
  }   
};