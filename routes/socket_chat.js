module.exports.listen = function(io, socket, rooms){
  //client --> server --> clients (chat message from client)
  socket.on('newChatMessage', function (data) {
    socket.get('room', function (err, room) {
      if(!err && room!="" && room !=null){
        socket.get('userId', function(err, userId){
          io.sockets.in(room).emit('newChatMessage', data, userId);          
      })
      }
    });
  });

  socket.on('changeUserId', function (newUserId) {
    socket.get('room', function (err, room) {
      if(!err && room!="" && room !=null){
        socket.get('userId', function(err, userId){
          socket.set('userId', newUserId, function(){
            io.sockets.in(room).emit('userIdChanged',userId, newUserId);
            io.sockets.in(room).emit('newChatMessage', userId + ' changed name to ' + newUserId, 'hackify');              
          });
        
      })
      }
    });
  });
};
