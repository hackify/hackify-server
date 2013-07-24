var socketAuth = require('../lib/socket_auth');

module.exports.listen = function(io, socket, rooms){
  //client --> server --> clients (chat message from client)
  socket.on('newChatMessage', function (data) {
    socketAuth.checkedOperation(rooms, socket, 'newChatMessage', function(room, userId){
      io.sockets.in(room).emit('newChatMessage', data, userId);          
    });
  });

  socket.on('changeUserId', function (newUserId) {
    socketAuth.checkedOperation(rooms, socket, 'changeUserId', function(room, userId){
      socket.set('userId', newUserId, function(){
        io.sockets.in(room).emit('userIdChanged',userId, newUserId);
        io.sockets.in(room).emit('newChatMessage', userId + ' changed name to ' + newUserId, 'hackify');              
      });
    });
  });
};
