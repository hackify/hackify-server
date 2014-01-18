var config = require('../config_' + (process.env.NODE_ENV || 'dev')),
    rm = require('./rooms_manager_' + ((config.useRedisForRoomState)?'redis' :'hash')),
    um = require('./users_manager_' + ((config.useRedisForUserState)?'redis' :'hash'));

module.exports.checkedOperation = function(socket, operationName, opCallback, errCallback){
  um.get(socket.id, function(err, userState){
    if(!err && userState){
      var roomName = userState.roomName;
      var userId = userState.userId;
      var role = userState.role;
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
    }
  });
};

module.exports.getSocketInfo = function(socket, opCallback, errCallback){

  um.get(socket.id, function(err, userState){
    if(!err && userState){
      var roomName = userState.roomName;
      var userId = userState.userId;
      var role = userState.role;
      rm.get(roomName, function(err, roomState){
        if(!err && roomState){
          opCallback(roomName, roomState, userId, role);
        } else {
          handleError(socket, errCallback, 'room ' + roomName + ' no longer exists');
        }
      });      
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