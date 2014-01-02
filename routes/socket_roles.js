var socketAuth = require('../lib/socket_auth'),
    uaw = require('../lib/universal-analytics-wrapper');

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
    socketAuth.getSocketInfo(socket, 'changeRole', function(roomName, roomState, userId, role){
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
          socket.set('requestedRole', newRole);
          io.sockets.in(roomName).emit('requestedRole',userId, newRole);
        }
      }
    });
  });

  module.exports.doRoleChange = function(io, roomName, userId, newRole){
    var clients = io.sockets.clients(roomName);
    clients.forEach(function(client){
      client.get('userId', function(err, clientUserId){
        if(clientUserId===userId){
          client.set('role', newRole);
          io.sockets.in(roomName).emit('userRoleChanged',userId, newRole);
          io.sockets.in(roomName).emit('newChatMessage', userId + ' is now ' + newRole, 'hackify');
          client.get('requestedRole', function(err, requestedRole){
            if(requestedRole && requestedRole!==""){
              client.set('requestedRole', null);
              io.sockets.in(roomName).emit('requestedRole',userId, null);
            }
          });
        }
      });
    });  
  }
};
