var vcompare = require('../lib/vcompare'),
    config = require('../config_' + (process.env.NODE_ENV || 'dev'));

module.exports.listen = function(io, socket, rooms){
  //host --> server --> host (host sends metadata and a request to create a new room, Host in return gets a request to get fresh file data)
  socket.on('createRoom', function (data) {
    var hostVersion = (data.hostVersion)?data.hostVersion:"0.1.0";
    if(vcompare.compare(hostVersion, config.minHostVersion) >= 0){
      socket.set('room', data.name);
      socket.set('userId', 'host');
      socket.join(data.name);
      if(!rooms[data.name]){
        //full update of state including ody and request fresh file (pick first file arbitrarily)
        rooms[data.name] = data;
        rooms[data.name].files = [];
        rooms[data.name].currentFile = "no file";
        rooms[data.name].hostSocket = socket;
        rooms[data.name].editingUserSocket = null;
        rooms[data.name].moderatorPass = data.moderatorPass;

        console.log('new room created:' + data.name);
      }else{
        //just update the files
        rooms[data.name].hostSocket = socket;
        console.log('host reconnected to room' + data.name);
      }   

    }else{
      console.log('version check failed hostVersion:%s config.minHostVersion:%s', hostVersion, config.minHostVersion);
      socket.emit('error', 'cannot join room, minimum host version is ' + config.minHostVersion + ' your hackify version is ' + hostVersion + '. please update your hackify module (npm install -g hackify)')
    }
  });

  //client --> server --> client (client joins a particular room and gets room data refreshed)
  socket.on('joinRoom', function (data) {
    console.log('recieved Join request room' + data.room);
    if(rooms[data.room]){
      //set up the socket properties
      socket.join(data.room);
      socket.set('room', data.room);
      var userId = (data.userId)?data.userId:'hckr' + Math.floor(Math.random() * 9999).toString();
      socket.set('userId', userId);

      //tell the socket about the room state
      var roomState = rooms[data.room];
      roomState.files.forEach(function(file){
        socket.emit('fileAdded', file)
      });
      socket.emit('changeCurrentFile', roomState.currentFile);
      socket.emit('refreshData', roomState.body);

      //if this is the first or only user, make him the editing user
      if(!roomState.editingUserSocket){
        roomState.editingUserSocket = socket; 
      }  

      //tell this socket about all of the users (including itself)
      var clients = io.sockets.clients(data.room);
      clients.forEach(function(client){
        client.get('userId', function(err, clientUserId){
          if(clientUserId){
            socket.emit('newUser', {
              userId:clientUserId, 
              isYou:(client===socket)?true:false,
              isEditing:(client===roomState.editingUserSocket)?true:false
            });
          }
        });
      });        

      //now tell all of the other sockets about the new user
      socket.broadcast.to(data.room).emit('newUser', {userId:userId, isYou:false});
    }else{
      socket.emit('newChatMessage','room ' + data.room + ' does not exist', 'hackify')
    }
  });

  //client --> server (client leaves a particular room)
  socket.on('leaveRoom', function (data) {
    socket.leave(data.room);
    socket.set('room', null);
    //todo - tell everybody else in room that user is gone.. also wire up same to socket disconnect...?? both??
  });

};
