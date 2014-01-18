var socketAuth = require('../lib/socket_auth'),
    ofm = require('../lib/openfiles_manager_' + ((config.useRedisForOpenFiles)?'redis' :'hash')),
    fm = require('../lib/files_manager_' + ((config.useRedisForFiles)?'redis' :'hash'));

module.exports.listen = function(io, socket){
  //host --> server (send hosted file data to the server for collaborative editing)
  //client --> server (active editor sends a full copy of the modified file data to the server)
  socket.on('refreshData', function (body, broadcast) {
    /*
    Note that both the 'refreshData' and 'changeData' operations defer to an 'editData' permission. 
    this is a deliberate deviation from the operation name === permission name scheme I have followed elsewhere.  Both of
    these messages fulfill the same effective permission of editing the data in the browser and splitting them would have
    meant that if you mis-configured a role to have one but not the other, crazy bugs would ensue.
    */
    socketAuth.checkedOperation(socket, 'editData', function(roomName, roomState, userId){
      //If the refresh is coming from the host, and is already in the open files, ignore it i.e. open files is the source of truth for this file.
      fm.getCurrentFile(roomName, function(err, currentFile){
        if(socket.id===roomState.hostSocket){
          ofm.exists(roomName, currentFile, function(err,res){
            if(!res){
              socket.broadcast.to(roomName).emit('refreshData', body);

              //all files chosen from the client are automatically 'open' i.e. no 'preview' functionality ah-la sublime
              ofm.store(roomName, currentFile, body, false, function(err,res){
                socket.broadcast.to(roomName).emit('openFiles', res);
              });
            }
          });          
        }else{
          ofm.store(roomName, currentFile, body, true, function(err,res){});        
        }  
      });     
    });
  });

  //client --> server --> clients (active editor sends incremental file data change to the server which then broadcasts it to other clients in the same room) 
  socket.on('changeData', function (op) {
    socketAuth.checkedOperation(socket, 'editData', function(roomName, roomState, userId){
      if (op.origin == '+input' || op.origin == 'paste' || op.origin == '+delete' || op.origin == 'undo') {
        socket.broadcast.to(roomName).emit('changeData', op);

        //mark file as dirty
        fm.getCurrentFile(roomName, function(err, currentFile){
          ofm.setIsDirty(roomName, currentFile, true, function(err,res){});
        });
      };
    });
  });  
};
