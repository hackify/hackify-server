var socketAuth = require('../lib/socket_auth'),
    uaw = require('../lib/universal-analytics-wrapper'),
    config = require('../config_' + (process.env.NODE_ENV || 'dev')),
    um = require('../lib/users_manager_' + ((config.useRedisForUserState)?'redis' :'hash'));


module.exports.listen = function(io, socket){

  socket.on('grantChangeRole', function (data) {
    var grantUserId = data.userId, newRole = data.newRole;  
    //TODO - Check that newRole is valid.. roomState.authmap[newRole]
    socketAuth.checkedOperation(socket, 'changeRole', function(roomName, roomState, userId){
      module.exports.doRoleChange(io, roomName, grantUserId, newRole);
      var visitor = uaw.getVisitor(socket.handshake.session);
      if(visitor){
        visitor.debug().event("referral", "Grant Role to another User").send();
      }             
    });
  });

  socket.on('requestChangeRole', function (data) {
    var grantUserId = data.userId, newRole = data.newRole, pass=data.pass;  
    //TODO - Check that newRole is valid.. roomState.authmap[newRole]
    socketAuth.getSocketInfo(socket, function(roomName, roomState, userId, role){
      if(newRole==='moderator'){
        if(pass===roomState.moderatorPass){
          module.exports.doRoleChange(io, roomName, grantUserId, newRole);

          var visitor = uaw.getVisitor(socket.handshake.session);
          if(visitor){
            visitor.debug().event("activation", "Host A Room").send();
          }

        }else{
          socket.emit('newChatMessage', 'moderator password incorrect');
        }
      }else{
        if(newRole==='default'){
          module.exports.doRoleChange(io, roomName, grantUserId, newRole);
        }else{
          um.setRequestedRole(socket.id, newRole);
          io.sockets.in(roomName).emit('requestedRole',userId, newRole);
        }
      }
    });
  });

  module.exports.doRoleChange = function(io, roomName, userId, newRole){
    um.getAllInRoom(roomName, function(err, users){
      users.forEach(function(user){
        if(user.userId===userId){
          um.setRole(user.clientId, newRole);
          um.setRequestedRole(user.clientId, '');
 
          io.sockets.in(roomName).emit('userRoleChanged',userId, newRole);
          io.sockets.in(roomName).emit('newChatMessage', userId + ' is now ' + newRole, 'hackify');
          io.sockets.in(roomName).emit('requestedRole',userId, null);
        }
      });
    });
  }
};
