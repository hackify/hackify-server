var async = require('async'),
    winston = require('winston');

//som.checkedOperation(rooms, socket, 'refreshData', function(room, userId){/*opp impl*/}[, function(err){/*err impl*/}])
module.exports.checkedOperation = function(rooms, socket, operationName, opCallback, errCallback){
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
      if(rooms[roomName]){
        var room = rooms[roomName];
        if( role==='host' || (room.authMap[role] && room.authMap[role][operationName]===true) ){
          opCallback(roomName, userId, role);
        }else{
          handleError(socket, errCallback, 'you are not authorised to perform the ' + operationName + ' operation');       
        }
      } else {
        handleError(socket, errCallback, 'room ' + roomName + ' no longer exists');
      }
    } else {
      winston.error('problem determining socket info', {err:err});
    }
  });
};

module.exports.getSocketInfo = function(rooms, socket, operationName, opCallback, errCallback){
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
      if(rooms[roomName]){
        opCallback(roomName, userId, role);
      } else {
        handleError(socket, errCallback, 'room ' + roomName + ' no longer exists');
      }
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