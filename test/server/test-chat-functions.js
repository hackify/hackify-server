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
    config.doneWithWait(done);
  });

  it('Should broadcast newUser for joining users', function(done){
    var user1Client = io.connect(socketURL, options);

    user1Client.on('connect', function(data){
      user1Client.emit('joinRoom', {room: mainConfig.testRoomName});
    });

    var newUserCount = 0;
    var hostFound = false;
    var hckrFound = false;
    user1Client.on('newUser', function(user){
      if(user.userId==='host') hostFound=true;
      if(user.userId.substring(0,4)==='hckr') hckrFound=true;
      if (++newUserCount==2){
        hostFound.should.equal(true);
        hckrFound.should.equal(true);
        user1Client.disconnect();
        config.doneWithWait(done);         
      }
    });
  });//it should

  it('Should broadcast chat messages to all users', function(done){
    var user1Client, user2Client;
    var message = 'Hello World';
    var messages = 0;
    var joinCount = 0;    

    user1Client = io.connect(socketURL, options);
    user2Client = io.connect(socketURL, options);

    user1Client.on('connect', function(data){
      user1Client.emit('joinRoom', {room: mainConfig.testRoomName});
    });

    user2Client.on('connect', function(data){
      user2Client.emit('joinRoom', {room: mainConfig.testRoomName});
    });

    user1Client.on('roomJoined', function(){
      if(++joinCount===2){
        user1Client.emit('newChatMessage', message);
      }
    });    

    user2Client.on('roomJoined', function(){
      if(++joinCount===2){
        user1Client.emit('newChatMessage', message);
      }
    });

    user2Client.on('newChatMessage', function(msg, userId){
      //interested only in user messages
      if(userId!='hackify'){
        msg.should.equal(message);
      }
      user2Client.disconnect();
      user1Client.disconnect();
      config.doneWithWait(done);
    });
  });//it should

  it('Should change user id and broadcast change and a chat message to all users', function(done){
    var user1Client, user2Client;
    var messages1 = 0, messages2 = 0;
    var charleneFound1 = false, charleneFound2 = false;
    var disconnectCount = 0;
    var joinCount = 0;

    user1Client = io.connect(socketURL, options);
    user2Client = io.connect(socketURL, options);

    user1Client.on('connect', function(data){
      user1Client.emit('joinRoom', {room: mainConfig.testRoomName});

    });

    user2Client.on('connect', function(data){
      user2Client.emit('joinRoom', {room: mainConfig.testRoomName});
    });

    user1Client.on('roomJoined', function(){
      if(++joinCount===2){
        user1Client.emit('changeUserId', 'charlene');
      }
    });

    user2Client.on('roomJoined', function(){
      if(++joinCount===2){
        user1Client.emit('changeUserId', 'charlene');
      }
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
      if(msg.indexOf('changed name to charlene')!=-1) charleneFound1 = true;
      if(charleneFound1 && charleneFound2){
        user1Client.disconnect();
        user2Client.disconnect();
        config.doneWithWait(done);
      }
    });   

    user2Client.on('newChatMessage', function(msg, userId){
      if(msg.indexOf('changed name to charlene')!=-1) charleneFound2 = true;
      if(charleneFound1 && charleneFound2){
        user1Client.disconnect();
        user2Client.disconnect();
        config.doneWithWait(done);
      }
    });    

  });//it should


});//describe
