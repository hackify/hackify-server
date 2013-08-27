var should = require('should');
var io = require('socket.io-client');
var config = require('./config_mocha');

var socketURL = config.socketURL;

var options ={
  transports: ['websocket'],
  'force new connection': true
};

describe("Room Functions",function(){
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

  it('Should broadcast room data to joining clients', function(done){
    var user1Client = io.connect(socketURL, options);
    var user2Client;

    user1Client.on('connect', function(data){
      user1Client.emit('joinRoom', {room: 'test'});
      user2Client = io.connect(socketURL, options);

      user2Client.on('connect', function(data){
        user2Client.emit('joinRoom', {room: 'test'});

        user2Client.on('changeCurrentFile', function(newFile){
          newFile.should.equal('no file');
        });

        user2Client.on('refreshData', function(data){
          data.should.equal('');
        });

        user2Client.on('roomReadOnly', function(readOnly){
          readOnly.should.equal(false);
        });

        user2Client.on('roomAuthMap', function(authMap){
          authMap.default.newChatMessage.should.equal(true);
        });

        user2Client.on('roomJoined', function(){
          user1Client.disconnect();
          user2Client.disconnect();
          done();
        });
      });
    });
  });//it should

});//describe
