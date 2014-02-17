var vcompare = require('../lib/vcompare'),
    winston = require('winston'),
    uaw = require('../lib/universal-analytics-wrapper'),
    mime = require('mime'),
    config = require('../config_' + (process.env.NODE_ENV || 'dev')),
    socketRoles = require('./socket_roles'),
    ofm = require('../lib/openfiles_manager_' + ((config.useRedisForOpenFiles)?'redis' :'hash')),
    fm = require('../lib/files_manager_' + ((config.useRedisForFiles)?'redis' :'hash')),
    rm = require('../lib/rooms_manager_' + ((config.useRedisForRoomState)?'redis' :'hash')),
    um = require('../lib/users_manager_' + ((config.useRedisForUserState)?'redis' :'hash'));

module.exports.listen = function(io, socket){
  //host --> server --> host (host sends metadata and a request to create a new room, Host in return gets a request to get fresh file data)
  socket.on('createRoom', function (data) {
    var hostVersion = (data.hostVersion)?data.hostVersion:"0.1.0";
    if(vcompare.compare(hostVersion, config.minHostVersion) >= 0){

      var roomState = data;
      var roomName = roomState.name;

      um.create(roomName, socket.id, 'host', {}, 'host', '');
      socket.join(roomName);

      // winston.info('socket_room.listen.createRoom socket.id:%s', socket.id);
      roomState.hostSocket = socket.id;
      roomState.authMap = {
        moderator:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':true},
        editor:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':false},
        default:{'editData':false, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': false, 'changeCurrentFile':false, 'changeRole':false}
      }

      rm.set(roomName, roomState, function(err, res){
        if(!err && res){
          //reset the other participants (if any) 
          socket.broadcast.to(data.name).emit('newUser', {userId:'host', isYou:false});
          socket.broadcast.to(data.name).emit('newChatMessage', 'host has re-entered the room', 'hackify');
          socket.broadcast.to(data.name).emit('resetHostData');
          fm.getAll(data.name, function(err, files){
            files.forEach(function(file){
              socket.broadcast.to(data.name).emit('fileAdded', file)
            });
          });

          socket.broadcast.to(data.name).emit('roomReadOnly', roomState.readOnly);

          //I wanted to give the host some positive feedback, also helps testing
          socket.emit('roomCreated');
          winston.info('room created', { name:data.name, hostVersion: data.hostVersion, hostAddr: socket.handshake.address });
        } else {
          socket.emit('error', 'cannot create room err:' + err);
          winston.info('room create failed err:%s', err);            
        }
      });        
    }else{
      winston.info('refusing room create (version check failed)', {hostVersion:hostVersion, minHostVersion: config.minHostVersion});
      socket.emit('error', 'cannot create room, minimum host version is ' + config.minHostVersion + ' your hackify version is ' + hostVersion + '. please update your hackify module (npm install -g hackify)')
    }
  });

  //client --> server --> client (client joins a particular room and gets room data refreshed)
  socket.on('joinRoom', function (data) {
    var roomName = data.room;
    rm.get(roomName, function(err, roomState){
      if(!err && roomState){
        //set up the socket properties
        console.log("socket.handshake.session:%s", JSON.stringify(socket.handshake.session));
        var userInfo = (socket.handshake.session && socket.handshake.session.uid)?socket.handshake.session:{};
        var userId = (userInfo.name)?userInfo.name:'hckr' + Math.floor(Math.random() * 9999).toString();

        //set up the socket state
        um.create(roomName, socket.id, userId, userInfo, 'default', '', function(err, results){
          if(!err){
            //join the room
            socket.join(roomName);

            socket.emit('roomJoined');

            //tell the socket about the room state
            fm.getAll(roomName, function(err, files){
              files.forEach(function(file){
                socket.emit('fileAdded', file)
              });
            });
            
            ofm.getAll(roomName, function(err, res){
              res.forEach(function(openFile){
                socket.emit('syncOpenFile', openFile);
              });
              fm.getCurrentFile(roomName, function(err, currentFile){
                socket.emit('changeCurrentFile', currentFile, mime.lookup(currentFile));
              });
            });

            socket.emit('roomReadOnly', roomState.readOnly);
            socket.emit('roomAuthMap', roomState.authMap);

            //tell this socket about all of the users (including itself)
            um.getAllInRoom(roomName, function(err, users){
              users.forEach(function(user){
                if(user.userId){
                  socket.emit('newUser', {
                    userId:user.userId, 
                    isYou:(user.userId===userId)?true:false,
                    userInfo: user.userInfo,
                    role: user.role,
                    requestedRole: user.requestedRole
                  });                  
                }
              });
            });

            //now tell all of the other sockets about the new user
            socket.broadcast.to(roomName).emit('newUser', {userId:userId, isYou:false, userInfo:userInfo, role:'default'});
            
            var visitor = uaw.getVisitor(socket.handshake.session);
            if(visitor){
              if(roomName==='demo')
                visitor.debug().event("aquisition", "Joined Demo Room").send();
              else if(roomName !== config.testRoomName)
                visitor.debug().event("activation", "Joined Hosted Room").send();        
            }

            winston.info('user joined room', {userId: userId, room:roomName, clientAddr: socket.handshake.address});
            
            //make user the moderator if they are the first joiner
            um.countMembersInRoom(roomName, function(err, userCount){
              if(roomName!=='demo' && userCount === 2){
                socketRoles.doRoleChange(io, roomName, userId, 'moderator');
              }
            });
          } else {
            winston.error('problem setting socket state', {err:err});
          }
        });
      }else{
        socket.emit('newChatMessage','room ' + roomName + ' does not exist', 'hackify')
      }
    });
  });

  socket.on('disconnect', function(){
    um.get(socket.id, function(err, userState){
      if(!err && userState){
        var roomName = userState.roomName;
        var userId = userState.userId;
        winston.info('disconnect', {userId: userId, room:roomName, clientId: socket.id});
        socket.leave(roomName);
        um.remove(socket.id, function(err, res){
          rm.get(roomName, function(err, roomState){
            if(!err && roomState){

              //tell everybody what happenned
              io.sockets.in(roomName).emit('exitingUser',userId);
              io.sockets.in(roomName).emit('newChatMessage', userId + ' has left the room', 'hackify');
              winston.info('user left room', {userId: userId, room:roomName, handshakeId: socket.id});

              um.countMembersInRoom(roomName, function(err, userCount){
                //check if room is empty
                if(userCount===0 && !roomState.permanent){
                  ofm.reset(roomName);
                  fm.reset(roomName);
                  rm.reset(roomName);
                  um.resetRoom(roomName);

                  winston.info('room closed', {room:roomName});
                }else if(socket.id===roomState.hostSocket){
                  roomState.readOnly = true;
                  roomState.hostSocket = null;
                  rm.set(roomName, roomState, function(err, res){
                    socket.broadcast.to(roomName).emit('roomReadOnly', true);
                    io.sockets.in(roomName).emit('newChatMessage', 'room is now read only', 'hackify');                  
                  });
                }
              });
            }
          });
        });
      }
    });
  });
};
