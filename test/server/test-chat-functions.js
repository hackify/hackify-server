var should = require('should');
var io = require('socket.io-client');
var config = require('./config_mocha');

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
        name: 'test',
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
      user1Client.emit('joinRoom', {room: 'test'});
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

    var checkMessage = function(client){
      client.on('newChatMessage', function(msg, userId){
        msg.should.equal(message);
        client.disconnect();
        messages++;
        if(messages === 2){
          done();
        };
      });
    };

    user1Client = io.connect(socketURL, options);
    checkMessage(user1Client);

    user1Client.on('connect', function(data){
      user1Client.emit('joinRoom', {room: 'test'});

      user2Client = io.connect(socketURL, options);
      checkMessage(user2Client);

      user2Client.on('connect', function(data){
        user2Client.emit('joinRoom', {room: 'test'});
        user2Client.emit('newChatMessage', message);
      });
    });
  });//it should

  it('Should change user id and broadcast change and a chat message to all users', function(done){
    var user1Client;

    var checkMessage = function(client){
      client.on('userIdChanged', function(userId, newUserId){
        userId.substring(0,4).should.equal('hckr');
        newUserId.should.equal('charlene');
      });

      client.on('newChatMessage', function(msg, userId){
        msg.indexOf('changed name to charlene').should.not.equal(-1);
        client.disconnect();
        done();
      });
    };

    user1Client = io.connect(socketURL, options);
    checkMessage(user1Client);

    user1Client.on('connect', function(data){
      user1Client.emit('joinRoom', {room: 'test'});
      user1Client.emit('changeUserId', 'charlene');
    });
  });//it should


});//describe
