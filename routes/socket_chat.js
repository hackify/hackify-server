var socketAuth = require('../lib/socket_auth'),
    rm = require('../lib/rooms_manager_' + ((config.useRedisForRoomState)?'redis' :'hash'));

module.exports.listen = function(io, socket){
  //client --> server --> clients (chat message from client)
  socket.on('newChatMessage', function (data) {
    socketAuth.checkedOperation(socket, 'newChatMessage', function(roomName, roomState, userId){
      io.sockets.in(roomName).emit('newChatMessage', data, userId);          
    });
  });

  socket.on('changeUserId', function (newUserId) {
    socketAuth.checkedOperation(socket, 'changeUserId', function(roomName, roomState, userId){
      socket.set('userId', newUserId, function(){
        io.sockets.in(roomName).emit('userIdChanged',userId, newUserId);
        io.sockets.in(roomName).emit('newChatMessage', userId + ' changed name to ' + newUserId, 'hackify');              
      });
    });
  });
};
