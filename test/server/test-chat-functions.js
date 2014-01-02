var should = require('should');
var io = require('socket.io-client');
var config = require('./config_mocha');
var mainConfig = require('../../config_' + (process.env.NODE_ENV || 'dev'));

var socketURL = config.socketURL;

var options ={
  transports: ['websocket'],
  'force new connection': true
};

describe("Chat Functions",function(){
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
  });

  afterEach(function(done){
    hostClient.disconnect();
    done();
  });

  it('Should broadcast newUser for joining users users', function(done){
    var user1Client = io.connect(socketURL, options);

    user1Client.on('connect', function(data){
      user1Client.emit('joinRoom', {room: mainConfig.testRoomName});
    });

    var newUserCount = 0;
    user1Client.on('newUser', function(user){
      newUserCount++;
      if(newUserCount==1){
        user.userId.should.equal('host');
      }else if (newUserCount==2){
        user.userId.substring(0,4).should.equal('hckr');
        user1Client.disconnect();
        done();          
      }
    });
  });//it should

  it('Should broadcast chat messages to all users', function(done){
    var user1Client, user2Client;
    var message = 'Hello World';
    var messages = 0;    

    user1Client = io.connect(socketURL, options);
    user2Client = io.connect(socketURL, options);

    user1Client.on('connect', function(data){
      user1Client.emit('joinRoom', {room: mainConfig.testRoomName});
    });

    user2Client.on('connect', function(data){
      user2Client.emit('joinRoom', {room: mainConfig.testRoomName});
    });

    user2Client.on('roomJoined', function(){
      user1Client.emit('newChatMessage', message);
    });

    user2Client.on('newChatMessage', function(msg, userId){
      //interested only in user messages
      if(userId!='hackify'){
        msg.should.equal(message);
      }
      user2Client.disconnect();
      user1Client.disconnect();
      done();
    });
  });//it should

  it('Should change user id and broadcast change and a chat message to all users', function(done){
    var user1Client, user2Client;
    var messages1 = 0, messages2 = 0;

    user1Client = io.connect(socketURL, options);
    user2Client = io.connect(socketURL, options);


    user1Client.on('connect', function(data){
      user1Client.emit('joinRoom', {room: mainConfig.testRoomName});

    });

    user2Client.on('connect', function(data){
      user2Client.emit('joinRoom', {room: mainConfig.testRoomName});
    });

    user2Client.on('roomJoined', function(){
      user1Client.emit('changeUserId', 'charlene');
    });

    user1Client.on('userIdChanged', function(userId, newUserId){
      userId.substring(0,4).should.equal('hckr');
      newUserId.should.equal('charlene');
    });

    user2Client.on('userIdChanged', function(userId, newUserId){
      userId.substring(0,4).should.equal('hckr');
      newUserId.should.equal('charlene');
    });

    user1Client.on('newChatMessage', function(msg, userId){
      messages1++;
      if(messages1==2){
        msg.indexOf('changed name to charlene').should.not.equal(-1);
        user1Client.disconnect();
      }
    });   

    user2Client.on('newChatMessage', function(msg, userId){
      messages2++;
      if(messages2==1){
        msg.indexOf('changed name to charlene').should.not.equal(-1);
      }
      if(messages2==2){
        user2Client.disconnect();
        done();
      }
    });    

  });//it should


});//describe
