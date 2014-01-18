var should = require('should');
var config = require('./config_mocha');
var mainConfig = require('../../config_' + (process.env.NODE_ENV || 'dev'));
var um = require('../../lib/users_manager_hash');

var testRoom = "testroom";

describe("Users Manager Hash",function(){
  beforeEach(function(done){
    um.resetRoom(testRoom, function(err, res){
        done();
    });  
  });

  afterEach(function(done){
    um.resetRoom(testRoom, function(err, res){
        done();
    });  
  });

  it('Should have an empty test', function(done){
    um.should.exist;
    done();
  });

  it('Should create user and retrieve properties individually', function(done){
    um.create(testRoom, '1234', "bob", {test:'test'}, 'default', 'admin', function(err, res){
        um.getRole('1234', function(err, res){
            should.not.exist(err);
            res.should.equal('default');

            um.getUserInfo('1234', function(err, res){
                should.not.exist(err);
                res.test.should.equal('test');
                
                um.getRequestedRole('1234', function(err, res){
                    should.not.exist(err);
                    res.should.equal('admin');
                    
                    um.getUserId('1234', function(err, res){
                        should.not.exist(err);
                        res.should.equal('bob');
                        
                        um.getRoom('1234', function(err, res){
                            should.not.exist(err);
                            res.should.equal(testRoom);
                            
                            done();
                        });                           
                    });                         
                });                
            });
        });
    });
  });//it should

  it('Should create user and retrieve user object', function(done){
    um.create(testRoom, '1234', "bob", {test:'test'}, 'default', 'admin', function(err, res){
        um.get('1234', function(err, res){
            should.not.exist(err);
            res.roomName.should.equal(testRoom);
            res.userId.should.equal('bob');
            res.role.should.equal('default');
            res.userInfo.test.should.equal('test');
            res.requestedRole.should.equal('admin');
            done();
        });
    });
  });//it should

  it('Should set role', function(done){
    um.create(testRoom, '1234', "bob", {test:'test'}, 'default', 'admin', function(err, res){
        um.setRole('1234', 'admin', function(err, res){
            um.getRole('1234', function(err, res){
                should.not.exist(err);
                res.should.equal('admin');
                done();
            });            
        });
    });
  });//it should  

  it('Should set requested role', function(done){
    um.create(testRoom, '1234', "bob", {test:'test'}, 'default', 'admin', function(err, res){
        um.setRequestedRole('1234', 'sillyrole', function(err, res){
            um.getRequestedRole('1234', function(err, res){
                should.not.exist(err);
                res.should.equal('sillyrole');
                done();
            });            
        });
    });
  });//it should  

  it('Should set userInfo', function(done){
    um.create(testRoom, '1234', "bob", {test:'test'}, 'default', 'admin', function(err, res){
        um.setUserInfo('1234', {test:'test2'}, function(err, res){
            um.getUserInfo('1234', function(err, res){
                should.not.exist(err);
                res.test.should.equal('test2');
                done();
            });            
        });
    });
  });//it should 

  it('Should allow re-storeage on same key', function(done){
    um.create(testRoom, '1234', "bob", {test:'test'}, 'default', 'admin', function(err, res){
        um.create(testRoom, '1234', "bob", {test:'test'}, 'admin', 'default', function(err, res){
            um.getRole('1234', function(err, res){
                should.not.exist(err);
                res.should.equal("admin");
                done();
            });
        });
    });
  });//it should

  it('Should remove an item from file list', function(done){
    um.create(testRoom, '1234', "bob", {test:'test'}, 'default', 'admin', function(err, res){
        um.create(testRoom, '3456', "martha", {test:'test2'}, 'admin', 'default', function(err, res){
            um.remove('1234', function(err, res){
                should.not.exist(err);
                um.getAllInRoom(testRoom, function(err, res){
                    res.length.should.equal(1);
                    res[0].userId.should.equal('martha');
                    res[0].userInfo.test.should.equal('test2');
                    res[0].role.should.equal('admin');
                    done();
                });
            });
        });
    });
  });//it should

  it('Should retrieve a full list', function(done){
    um.create(testRoom, '1234', "bob", {test:'test'}, 'default', 'admin', function(err, res){
        um.create(testRoom, '3456', "martha", {test:'test2'}, 'admin', 'default', function(err, res){
            um.getAllInRoom(testRoom, function(err, res){
                should.not.exist(err);
                res.sort(function(a,b){return b.userId < a.userId});
                res.length.should.equal(2);
                res[0].roomName.should.equal(testRoom);
                res[0].clientId.should.equal('1234');
                res[0].userId.should.equal('bob');
                res[0].userInfo.test.should.equal('test');
                res[0].role.should.equal("default");
                res[0].requestedRole.should.equal("admin");
                res[1].roomName.should.equal(testRoom);
                res[1].clientId.should.equal('3456');
                res[1].userId.should.equal('martha');
                res[1].userInfo.test.should.equal('test2');
                res[1].role.should.equal("admin");
                res[1].requestedRole.should.equal("default");
                done();
            });
        });
    });
  });//it should

  it('Should count users in room', function(done){
    um.create(testRoom, '1234', "bob", {test:'test'}, 'default', 'admin', function(err, res){
        um.create(testRoom, '3456', "martha", {test:'test2'}, 'admin', 'default', function(err, res){
            um.countMembersInRoom(testRoom, function(err, res){
                should.not.exist(err);
                res.should.equal(2);
                done();
            });
        });
    });
  });//it should

});//describe
