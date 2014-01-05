var vcompare = require('../lib/vcompare'),
    async = require('async'),
    winston = require('winston'),
    uaw = require('../lib/universal-analytics-wrapper'),
    mime = require('mime'),
    config = require('../config_' + (process.env.NODE_ENV || 'dev')),
    socketRoles = require('./socket_roles'),
    em = require('../lib/events_manager_' + ((config.useRedisForEvents)?'redis' :'hash')),
    ofm = require('../lib/openfiles_manager_' + ((config.useRedisForOpenFiles)?'redis' :'hash')),
    fm = require('../lib/files_manager_' + ((config.useRedisForFiles)?'redis' :'hash')),
    rm = require('../lib/rooms_manager_' + ((config.useRedisForRoomState)?'redis' :'hash'));

module.exports.listen = function(io, socket){
  //host --> server --> host (host sends metadata and a request to create a new room, Host in return gets a request to get fresh file data)
  socket.on('createRoom', function (data) {
    var hostVersion = (data.hostVersion)?data.hostVersion:"0.1.0";
    if(vcompare.compare(hostVersion, config.minHostVersion) >= 0){
      var eventModeratorPass=null;
      if(em.exists(data.name)){
        eventModeratorPass = em.getByKey(data.name).moderatorPass;
      };

      if(eventModeratorPass===null || eventModeratorPass===data.moderatorPass){
        var roomState = data;
        var roomName = roomState.name;

        socket.set('room', roomName);
        socket.set('userId', 'host');
        socket.set('role', 'host');
        socket.join(data.name);

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

            if(em.exists(data.name)){
              var event = em.getByKey(data.name);
              event.status = 'open';
              event.comments.push({userName:'hackify', comment:'room opened by Host', date:new Date()});
              em.store(event);
            };

            //I wanted to give the host some positive feedback, also helps testing
            socket.emit('roomCreated');
            winston.info('room created', { name:data.name, hostVersion: data.hostVersion, hostAddr: socket.handshake.address });
          } else {
            socket.emit('error', 'cannot create room err:' + err);
            winston.info('room create failed err:%s', err);            
          }
        });        
      }else{
        winston.info('refusing room create (moderator pass mismatch with event)', {hostVersion:hostVersion, minHostVersion: config.minHostVersion});
        socket.emit('error', 'cannot create room, moderator pass does not match associated event.  reset pass at http://hackify.com/events/' + data.name);
      }
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
        var userInfo = (socket.handshake.session && socket.handshake.session.passport.user)?socket.handshake.session.passport.user:{};
        var userId = (userInfo.displayName)?userInfo.displayName:'hckr' + Math.floor(Math.random() * 9999).toString();

        //set up the socket state
        async.parallel([
          function(callback){ socket.set('room', roomName, function(err, res){ callback(err, res); }); },
          function(callback){ socket.set('userInfo', userInfo, function(err, res){ callback(err, res); }); },
          function(callback){ socket.set('userId', userId, function(err, res){ callback(err, res); }); },
          function(callback){ socket.set('role', 'default', function(err, res){ callback(err, res); }); }
        ],
        function(err, results){
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
            var clients = io.sockets.clients(roomName);
            clients.forEach(function(client){
              async.parallel([
                function(callback){ client.get('userId', function(err, val){ callback(err, val); }); },
                function(callback){ client.get('userInfo', function(err, val){ callback(err, val); }); },
                function(callback){ client.get('role', function(err, val){ callback(err, val); }); },
                function(callback){ client.get('requestedRole', function(err, val){ callback(err, val); }); }
              ],
              function(err, results){
                if(!err){
                  var clientUserId = results[0], clientUserInfo = results[1], clientRole = results[2], clientRequestedRole = results[3];

                  if(clientUserId){
                    socket.emit('newUser', {
                      userId:clientUserId, 
                      isYou:(client===socket)?true:false,
                      userInfo: clientUserInfo,
                      role: clientRole,
                      requestedRole: clientRequestedRole
                    });
                  }
                } else {
                  winston.error('problem determining socket info', {err:err});
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
            if(!em.exists(roomName) && io.sockets.clients(roomName).length === 2){
              socketRoles.doRoleChange(io, roomName, userId, 'moderator');
            }
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
    socket.get('room', function (err, roomName) {
      if(!err && roomName){
        rm.get(roomName, function(err, roomState){
          if(!err && roomState){
            socket.get('userId', function(err, userId){
              socket.leave(roomName);
              socket.set('room', null);
              io.sockets.in(roomName).emit('exitingUser',userId);
              io.sockets.in(roomName).emit('newChatMessage', userId + ' has left the room', 'hackify');

              winston.info('user left room', {userId: userId, room:roomName, handshakeId: socket.id});

              //check if room is empty
              if(io.sockets.clients(roomName).length===0 && !roomState.permanent){
                ofm.reset(roomName);
                fm.reset(roomName);
                rm.reset(roomName);

                if(em.exists(roomName)){
                  var event = em.getByKey(roomName);
                  event.status = 'closed';
                  event.comments.push({userName:'hackify', comment:'room closed', date:new Date()});
                  em.store(event);
                };

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
      }
    });
  });
};
