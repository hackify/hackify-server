var should = require('should');
var io = require('socket.io-client');
var config = require('./config_mocha');
var mainConfig = require('../../config_' + (process.env.NODE_ENV || 'dev'));

var socketURL = config.socketURL;

var options ={
  transports: ['websocket'],
  'force new connection': true
};

describe("Code Functions",function(){
  var hostClient;

  this.timeout(20000);

  beforeEach(function(done){
    hostClient = io.connect(socketURL, options);

    hostClient.on('connect', function(data){
      hostClient.emit('createRoom', {
        name: mainConfig.testRoomName,
        moderatorPass: '1234',
        readOnly: false,
        hostVersion: "0.1.4"
      });

      hostClient.on('roomCreated', function(){
        done();
      })
    });

    //set up a mock for the host behaviour
    var fileAContent = "this is file a";
    var fileBContent = "this is file b";
    hostClient.on('changeCurrentFile', function(newFile){
      switch(newFile){
        case "a.txt":
        hostClient.emit('refreshData', fileAContent, true);
        break;
        
        case "b.txt":
        hostClient.emit('refreshData', fileBContent, true);
        break;
        
        case "unhosted.txt":
        hostClient.emit('newChatMessage', 'changeCurrentFile for ' + newFile + ' refused... file is not hosted'); 
        break;
        
        case "readerror.txt":
        hostClient.emit('newChatMessage', "error reading file " + newFile + ' ' + err);
        break;
      }
    });

    hostClient.on('saveCurrentFile', function(data){
      if(data.file=="a.txt"){
        fileAContent = data.body;
        hostClient.emit('newChatMessage', "file save succeeded for file " + data.file);
      }

      if(data.file=="b.txt"){
        fileBContent = data.body;
        hostClient.emit('newChatMessage', "file save succeeded for file " + data.file);
      }

      //unmocked responses
      //hostClient.emit('newChatMessage', 'file save for ' + data.file + ' refused... room is read only');
      //hostClient.emit('newChatMessage', 'file save for ' + data.file + ' refused... file is not hosted');      
    });  



  });

  afterEach(function(done){
    hostClient.disconnect();
    done();
  });

    

  it('Should broadcast refreshData for new clients', function(done){
    var user1Client = io.connect(socketURL, options);
    var user2Client;

    user1Client.on('connect', function(data){
      user1Client.emit('joinRoom', {room: mainConfig.testRoomName});
      
      //need to have access permissions to mess about with data so get moderator role
      user1Client.emit('changeUserId', 'bob');

      user1Client.on('userRoleChanged', function(userId, role){
        role.should.equal('moderator');
        user1Client.emit('refreshData', 'this is the body', true);

        user1Client.on('refreshData', function(data){
          data.should.equal('this is the body');
        });

        user2Client = io.connect(socketURL, options);

        user2Client.on('connect', function(data){
          user2Client.emit('joinRoom', {room: mainConfig.testRoomName});
          user2Client.on('refreshData', function(data){
            data.should.equal('this is the body');
            user1Client.disconnect();
            user2Client.disconnect();
            
            done();
          });
        });
      });
    });
  });//it should

  it('Should broadcast refreshData for existing clients', function(done){
    var user1Client = io.connect(socketURL, options);
    var user2Client;refreshCounter = 0;

    user1Client.on('connect', function(data){
      user1Client.emit('joinRoom', {room: mainConfig.testRoomName});
      
      user1Client.on('refreshData', function(data){
        refreshCounter++;
        if(refreshCounter==2){
          data.should.equal('this is the body');
          user1Client.disconnect();
          user2Client.disconnect();

          done();
        }
      });

      user2Client = io.connect(socketURL, options);

      user2Client.on('connect', function(data){
        user2Client.emit('joinRoom', {room: mainConfig.testRoomName});

        user2Client.on('roomJoined', function(){
          user2Client.emit('changeUserId', 'charlene');
          user2Client.emit('requestChangeRole', {userId:'charlene', newRole:'moderator', pass:'1234'});

          user2Client.on('userRoleChanged', function(userId, role){
            user2Client.emit('refreshData', 'this is the body', true);
          });
        });
      });
    });
  });//it should

  it('Should broadcast changeData for existing clients', function(done){
    var user1Client = io.connect(socketURL, options);
    var user2Client;refreshCounter = 0;

    user1Client.on('connect', function(data){
      user1Client.emit('joinRoom', {room: mainConfig.testRoomName});

      
     user1Client.on('changeData', function(op){
        op.origin.should.equal('+input');
        user1Client.disconnect();
        user2Client.disconnect();

        done();
      });

      user2Client = io.connect(socketURL, options);

      user2Client.on('connect', function(data){
        user2Client.emit('joinRoom', {room: mainConfig.testRoomName});

        user2Client.on('roomJoined', function(){
          user2Client.emit('changeUserId', 'charlene');
          user2Client.emit('requestChangeRole', {userId:'charlene', newRole:'moderator', pass:'1234'});

          user2Client.on('userRoleChanged', function(userId, role){
            user2Client.emit('changeData', {origin:'+input'});
          });
        });
      });
    });
  });//it should

  it('Should hold changes between file switches', function(done){
    var user1Client = io.connect(socketURL, options);
    var user2Client;refreshCounter = 0;

    user1Client.on('connect', function(data){
      user1Client.emit('joinRoom', {room: mainConfig.testRoomName});

      user1Client.on('refreshData', function(body){
        refreshCounter++;
        if(refreshCounter==2){
          body.should.equal('this is file a changed');
          user1Client.disconnect();
          user2Client.disconnect();
          done();          
        }
        console.log('refreshCounter:%s body:%s', refreshCounter, body);
      });

      user2Client = io.connect(socketURL, options);

      user2Client.on('connect', function(data){
        user2Client.emit('joinRoom', {room: mainConfig.testRoomName});

        user2Client.on('roomJoined', function(){
          user2Client.emit('changeUserId', 'charlene');
          user2Client.emit('requestChangeRole', {userId:'charlene', newRole:'moderator', pass:'1234'});

          user2Client.on('userRoleChanged', function(userId, role){
            user2Client.emit('changeCurrentFile', "a.txt");
            user2Client.emit('refreshData', 'this is file a changed', false);
            user2Client.emit('changeCurrentFile', "b.txt");
            user2Client.emit('refreshData', 'this is file b changed', false);
            user2Client.emit('changeCurrentFile', "a.txt");//finally, flip back to a.txt. it should maintiain the changes and not pull from host again
          });
        });
      });
    });
  });//it should

});//describe
