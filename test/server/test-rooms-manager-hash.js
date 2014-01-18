var should = require('should');
var config = require('./config_mocha');
var mainConfig = require('../../config_' + (process.env.NODE_ENV || 'dev'));
var rm = require('../../lib/rooms_manager_hash');

var testRoom = "testroom", testRoom2 = "testroom2";

var testRoomState = {
  name: testRoom,
  moderatorPass: 'testpass',
  readOnly: false,
  hostSocket: null,
  authMap: {
    moderator:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':true},
    editor:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':false},
    default:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':false}
  },
  permanent: false
};

describe("Rooms Manager Hash",function(){
  beforeEach(function(done){
    rm.reset(testRoom, function(err, res){
        done();
    });  
  });

  afterEach(function(done){
    rm.reset(testRoom, function(err, res){
        done();
    });  
  });

  it('Should have an empty test', function(done){
    rm.should.exist;
    done();
  });
  
  it('Should store and retrieve a room', function(done){
    rm.set(testRoom, testRoomState, function(err, res){
        rm.get(testRoom, function(err, res){
            should.not.exist(err);
            res.name.should.equal(testRoom);
            done();
        });
    });
  });//it should

  it('should indicate existance', function(done){
    rm.set(testRoom, testRoomState, function(err, res){
        rm.exists(testRoom, function(err, res){
            should.not.exist(err);
            res.should.equal(true);
            rm.exists('silly', function(err, res){
              should.not.exist(err);
              res.should.equal(false);
              done();
            })
        });
    });
  });//it should

  it('should retrieve room names', function(done){
    rm.set(testRoom, testRoomState, function(err, res){
      rm.set(testRoom2, testRoomState, function(err, res){
        rm.getAllRoomNames(function(err, roomNames){
          roomNames.length.should.equal(2);
          roomNames[0].should.equal(testRoom);
          roomNames[1].should.equal(testRoom2);
          done();
        });
      });
    });
  });//it should

});//describe
