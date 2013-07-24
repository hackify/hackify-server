var socketAuth = require('../lib/socket_auth');

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
      rooms[room].body = body;
      if(broadcast){
        socket.broadcast.to(room).emit('refreshData', body);
      }         
    });
  });

  //client --> server --> clients (active editor sends incremental file data change to the server which then broadcasts it to other clients in the same room)
  socket.on('changeData', function (op) {
    socketAuth.checkedOperation(rooms, socket, 'editData', function(room, userId){
      if (op.origin == '+input' || op.origin == 'paste' || op.origin == '+delete') {
        socket.broadcast.to(room).emit('changeData', op);
      };
    });
  });  
};
