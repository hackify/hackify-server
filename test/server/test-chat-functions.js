var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://localhost:4000';

var options ={
  transports: ['websocket'],
  'force new connection': true
};

describe("Chat Functions",function(){
  var hostClient;

  beforeEach(function(done){
    hostClient = io.connect(socketURL, options);

    hostClient.on('connect', function(data){
      hostClient.emit('createRoom', {
        name: 'test',
        moderatorPass: 1234,
        readOnly: false,
        hostVersion: "0.1.4"
      });

      hostClient.on('roomCreated', function(){
        done();
      })
    });
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
});//describe
