module.exports.listen = function(io, socket, rooms){
  //host --> server (send hosted file data to the server for collaborative editing)
  //client --> server (active editor sends a full copy of the modified file data to the server)
  socket.on('refreshData', function (body, broadcast) {
    socket.get('room', function (err, room) {
      rooms[room].body = body;
      if(broadcast){
        socket.broadcast.to(room).emit('refreshData', body);
      }   
    });
  });

  //client --> server --> clients (active editor sends incremental file data change to the server which then broadcasts it to other clients in the same room)
  socket.on('changeData', function (op) {
    socket.get('room', function (err, room) {
      if(!err && room!="" && room !=null){
        if (op.origin == '+input' || op.origin == 'paste' || op.origin == '+delete') {
          socket.broadcast.to(room).emit('changeData', op);
        };        
      }
    });
  });  

};
