var socketAuth = require('../lib/socket_auth'),
    mime = require('mime'),
    ofm = require('../lib/openfiles_manager_' + ((config.useRedisForOpenFiles)?'redis' :'hash'));

module.exports.listen = function(io, socket, rooms){
  //client --> server --> client/host (client requests a change to the file which is passed on to the host so it can load the file and the clients so they can change the file heading)
  socket.on('changeCurrentFile', function(newFile){  
    socketAuth.checkedOperation(rooms, socket, 'changeCurrentFile', function(room, userId){
      rooms[room].currentFile = newFile;
      io.sockets.in(room).emit('changeCurrentFile', newFile, mime.lookup(newFile));
    });    
  });

  //client --> server --> Host (Client requests a file save, server tells the host to do it)
  socket.on('saveCurrentFile', function(){
    socketAuth.checkedOperation(rooms, socket, 'saveCurrentFile', function(room, userId){
        ofm.get(room, rooms[room].currentFile, function(err, res){
          //broadcast save to everybody.  host will use it to actually save, for other clients, acts as a sync.  should probably get a response
          //from the host first as this is a bit hopefull (what if host fails to save?)
          io.sockets.in(room).emit('saveCurrentFile', {file:rooms[room].currentFile, body:res});
        });
        
        //mark file as clean
        ofm.setIsDirty(room, rooms[room].currentFile, false, function(err,res){});      
    });    
  });

  socket.on('reloadCurrentFile', function(){
    socketAuth.checkedOperation(rooms, socket, 'saveCurrentFile', function(room, userId){
      if(rooms[room].hostSocket){
        ofm.remove(room, rooms[room].currentFile, function(err,res){
          if(res){
            rooms[room].hostSocket.emit('changeCurrentFile', rooms[room].currentFile, mime.lookup(rooms[room].currentFile));
          }
        });
      }
    });    
  });

  //host --> server --> client (Host watches its file system and notifies server of changes, server passes this on to clients if its validated)
  socket.on('fileAdded', function (file) {
    socketAuth.checkedOperation(rooms, socket, 'fileAdded', function(room, userId){
      if(rooms[room].files.indexOf(file) === -1){
        rooms[room].files.push(file);
        io.sockets.in(room).emit('fileAdded', file);          
      }
    });
  });  

  socket.on('fileDeleted', function (file) {
    socketAuth.checkedOperation(rooms, socket, 'fileDeleted', function(room, userId){
      if(rooms[room].files.indexOf(file) > -1){
        rooms[room].files.splice(rooms[room].files.indexOf(file), 1);
        io.sockets.in(room).emit('fileDeleted', file);          
      }
    });
  });  

  socket.on('fileChanged', function (file) {
    socketAuth.checkedOperation(rooms, socket, 'fileChanged', function(room, userId){
      if(rooms[room].files.indexOf(file) > -1){
        io.sockets.in(room).emit('fileChanged', file);          
      }
    });
  });

  socket.on('closeFile', function (file) {
    socketAuth.checkedOperation(rooms, socket, 'changeCurrentFile', function(room, userId){
      io.sockets.in(room).emit('closeFile', file);
      ofm.remove(room, file, function(err,res){});
    });
  });  

};
