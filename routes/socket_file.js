module.exports.listen = function(io, socket, rooms){
  //client --> server --> client/host (client requests a change to the file which is passed on to the host so it can load the file and the clients so they can change the file heading)
  socket.on('changeCurrentFile', function(newFile){
    socket.get('room', function (err, room) {
      if(!err && room!="" && room !=null){
        rooms[room].currentFile = newFile;
        io.sockets.in(room).emit('changeCurrentFile', newFile);
      }
    });    
  });

  //client --> server --> Host (Client requests a file save, server tells the host to do it)
  socket.on('saveCurrentFile', function(){
    socket.get('room', function (err, room) {
      if(!err && room!="" && room !=null){
        rooms[room].hostSocket.emit('saveCurrentFile', {file:rooms[room].currentFile, body:rooms[room].body})
      }
    });    
  });

  //host --> server --> client (Host watches its file system and notifies server of changes, server passes this on to clients if its validated)
  socket.on('fileAdded', function (file) {
    socket.get('room', function (err, room) {
      if(!err && room!="" && room !=null){
        if(rooms[room].files.indexOf(file) === -1){
          rooms[room].files.push(file);
          io.sockets.in(room).emit('fileAdded', file);          
        }
      }
    });
  });  

  socket.on('fileDeleted', function (file) {
    socket.get('room', function (err, room) {
      if(!err && room!="" && room !=null){
        if(rooms[room].files.indexOf(file) > -1){
          rooms[room].files.splice(rooms[room].files.indexOf(file), 1);
          io.sockets.in(room).emit('fileDeleted', file);          
        }
      }
    });
  });  

  socket.on('fileChanged', function (file) {
    socket.get('room', function (err, room) {
      if(!err && room!="" && room !=null){
        if(rooms[room].files.indexOf(file) > -1){
          io.sockets.in(room).emit('fileChanged', file);          
        }
      }
    });
  });  

};
