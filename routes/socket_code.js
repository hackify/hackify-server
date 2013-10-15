var socketAuth = require('../lib/socket_auth'),
    ofm = require('../lib/openfiles_manager_hash');

module.exports.listen = function(io, socket, rooms){
  //host --> server (send hosted file data to the server for collaborative editing)
  //client --> server (active editor sends a full copy of the modified file data to the server)
  socket.on('refreshData', function (body, broadcast) {
    /*
    Note that both the 'refreshData' and 'changeData' operations defer to an 'editData' permission. 
    this is a deliberate deviation from the operation name === permission name scheme I have followed elsewhere.  Both of
    these messages fulfill the same effective permission of editing the data in the browser and splitting them would have
    meant that if you mis-configured a role to have one but not the other, crazy bugs would ensue.
    */
    socketAuth.checkedOperation(rooms, socket, 'editData', function(room, userId){
      //If the refresh is coming from the host, and is already in the open files, ignore it i.e. open files is the source of truth for this file. TODO - handle change to the host file for open files
      if(socket===rooms[room].hostSocket){
        ofm.exists(rooms[room].currentFile, function(err,res){
          if(!res){
            rooms[room].body = body;
            if(broadcast){
              socket.broadcast.to(room).emit('refreshData', body);
            }

            //all files chosen from the client are automatically 'open' i.e. no 'preview' functionality ah-la sublime
            ofm.store(body, rooms[room].currentFile, false, function(err,res){
              socket.broadcast.to(room).emit('openFiles', res);
            });
          }
        })
      }else{
        rooms[room].body = body;
        if(broadcast){
          socket.broadcast.to(room).emit('refreshData', body);
        }        
      }       
    });
  });

  //client --> server --> clients (active editor sends incremental file data change to the server which then broadcasts it to other clients in the same room) 
  socket.on('changeData', function (op) {
    socketAuth.checkedOperation(rooms, socket, 'editData', function(room, userId){
      if (op.origin == '+input' || op.origin == 'paste' || op.origin == '+delete' || op.origin == 'undo') {
        socket.broadcast.to(room).emit('changeData', op);

        //mark file as dirty and broadcast
        console.log('setting isdirty to true for %s', rooms[room].currentFile);
        ofm.setIsDirty(rooms[room].currentFile, true, function(err,res){
          console.log('back from isDirty res:%s', res);
          if(res){
            ofm.getList(function(err, res){
              io.sockets.in(room).emit('openFiles', res);
            });
          }
        });
      };
    });
  });  
};
