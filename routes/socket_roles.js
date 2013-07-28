var socketAuth = require('../lib/socket_auth');

module.exports.listen = function(io, socket, rooms){

  socket.on('grantChangeRole', function (data) {
    var grantUserId = data.userId, newRole = data.newRole;  
    //TODO - Check that newRole is valid.. rooms[room].authmap[newRole]
    socketAuth.checkedOperation(rooms, socket, 'changeRole', function(room, userId){
      doRoleChange(io, room, grantUserId, newRole);       
    });
  });

  socket.on('requestChangeRole', function (data) {
    var grantUserId = data.userId, newRole = data.newRole, pass=data.pass;  
    //TODO - Check that newRole is valid.. rooms[room].authmap[newRole]
    socketAuth.getSocketInfo(rooms, socket, 'changeRole', function(room, userId, role){
      if(newRole==='default' | (newRole==='moderator' & pass===rooms[room].moderatorPass)){
        doRoleChange(io, room, grantUserId, newRole);
      }  
    });
  });

  var doRoleChange = function(io, room, userId, newRole){
    var clients = io.sockets.clients(room);
    clients.forEach(function(client){
      client.get('userId', function(err, clientUserId){
        if(clientUserId===userId){
          client.set('role', newRole);
          io.sockets.in(room).emit('userRoleChanged',userId, newRole);
          io.sockets.in(room).emit('newChatMessage', userId + ' is now ' + newRole, 'hackify');  
        }
      });
    });  
  }
};
