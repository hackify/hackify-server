var socketAuth = require('../lib/socket_auth'),
    mime = require('mime'),
    ofm = require('../lib/openfiles_manager_' + ((config.useRedisForOpenFiles)?'redis' :'hash')),
    fm = require('../lib/files_manager_' + ((config.useRedisForFiles)?'redis' :'hash'));

module.exports.listen = function(io, socket){
  //client --> server --> client/host (client requests a change to the file which is passed on to the host so it can load the file and the clients so they can change the file heading)
  socket.on('changeCurrentFile', function(newFile){  
    socketAuth.checkedOperation(socket, 'changeCurrentFile', function(roomName, roomState, userId){
      fm.setCurrentFile(roomName, newFile, function(err, res){
        if(!err){
          io.sockets.in(roomName).emit('changeCurrentFile', newFile, mime.lookup(newFile));
        }
      });
    });    
  });

  //client --> server --> Host (Client requests a file save, server tells the host to do it)
  socket.on('saveCurrentFile', function(){
    socketAuth.checkedOperation(socket, 'saveCurrentFile', function(roomName, roomState, userId){
      fm.getCurrentFile(roomName, function(err, currentFile){
        ofm.get(roomName, currentFile, function(err, res){
          //broadcast save to everybody.  host will use it to actually save, for other clients, acts as a sync.  should probably get a response
          //from the host first as this is a bit hopefull (what if host fails to save?)
          io.sockets.in(roomName).emit('saveCurrentFile', {file:currentFile, body:res});
        });
        
        //mark file as clean
        ofm.setIsDirty(roomName, currentFile, false, function(err,res){});   
      });   
    });    
  });

  socket.on('reloadCurrentFile', function(){
    socketAuth.checkedOperation(socket, 'saveCurrentFile', function(roomName, roomState, userId){
      if(roomState.hostSocket){
        fm.getCurrentFile(roomName, function(err, currentFile){
          ofm.remove(roomName, currentFile, function(err,res){
            if(res){
              io.sockets.sockets[roomState.hostSocket].emit('changeCurrentFile', currentFile, mime.lookup(currentFile));
            }
          });          
        });
      }
    });    
  });

  //host --> server --> client (Host watches its file system and notifies server of changes, server passes this on to clients if its validated)
  socket.on('fileAdded', function (file) {
    socketAuth.checkedOperation(socket, 'fileAdded', function(roomName, roomState, userId){
      fm.exists(roomName, file, function(err, fileExists){
        if(!fileExists){
          fm.store(roomName, file, function(err, res){
            io.sockets.in(roomName).emit('fileAdded', file);
          });
        }        
      });
    });
  });  

  socket.on('fileDeleted', function (file) {
    socketAuth.checkedOperation(socket, 'fileDeleted', function(roomName, roomState, userId){
      fm.exists(roomName, file, function(err, fileExists){
        if(fileExists){
          fm.remove(roomName, file, function(err, res){
            io.sockets.in(roomName).emit('fileDeleted', file); 
          });
        }
      });
    });
  });  

  socket.on('fileChanged', function (file) {
    socketAuth.checkedOperation(socket, 'fileChanged', function(roomName, roomState, userId){
      fm.exists(roomName, file, function(err, fileExists){
        if(fileExists){
          io.sockets.in(roomName).emit('fileChanged', file); 
        }
      });
    });  
  });

  socket.on('closeFile', function (file) {
    socketAuth.checkedOperation(socket, 'changeCurrentFile', function(roomName, roomState, userId){
      if(roomState.permanent!=true){
        io.sockets.in(roomName).emit('closeFile', file);
        ofm.remove(roomName, file, function(err,res){});
      }
    });
  });  

};
