var should = require('should');
var config = require('./config_mocha');
var mainConfig = require('../../config_' + (process.env.NODE_ENV || 'dev'));
var ofm = require('../../lib/openfiles_manager_hash');

var testRoom = "testroom";

describe("Open Files Manager Hash Test",function(){
  beforeEach(function(done){
    ofm.reset(testRoom, function(err, res){
        done();
    });  
  });

  afterEach(function(done){
    ofm.reset(testRoom, function(err, res){
        done();
    });  
  });

  it('Should have an empty test', function(done){
    ofm.should.exist;
    done();
  });

  it('Should store and retrieve an open file', function(done){
    ofm.store(testRoom, "/users/michael/file.txt", "this is the body", true, function(err, res){
        ofm.get(testRoom, "/users/michael/file.txt", function(err, res){
            should.not.exist(err);
            res.should.equal("this is the body");
            done();
        });
    });
  });//it should

  it('Should indicate existance', function(done){
    ofm.store(testRoom, "/users/michael/file.txt", "this is the body", true, function(err, res){
        ofm.exists(testRoom, "/users/michael/file.txt", function(err, res){
            should.not.exist(err);
            res.should.equal(true);
            ofm.exists(testRoom, 'silly.txt', function(err, res){
                should.not.exist(err);
                res.should.equal(false);                
                done();
            })
        });
    });
  });//it should

  it('Should indicate dirtiness', function(done){
    ofm.store(testRoom, "/users/michael/file.txt", "this is the body", true, function(err, res){
        ofm.isDirty(testRoom, "/users/michael/file.txt", function(err, res){
            should.not.exist(err);
            res.should.equal(true);
            done();
        });
    });
  });//it should

  it('Should allow re-storeage on same key', function(done){
    ofm.store(testRoom, "/users/michael/file.txt", "this is the body", true, function(err, res){
        ofm.store(testRoom, "/users/michael/file.txt", "this is the new body", false, function(err, res){
            ofm.get(testRoom, "/users/michael/file.txt", function(err, res){
                should.not.exist(err);
                res.should.equal("this is the new body");
                done();
            });
        });
    });
  });//it should  

  it('Should store with null isDirty', function(done){
    ofm.store(testRoom, "/users/michael/file.txt", "this is the body", null, function(err, res){
        ofm.isDirty(testRoom, "/users/michael/file.txt", function(err, res){
            should.not.exist(err);
            res.should.equal(false);
            done();
        });
    });
  });//it should

  it('Should use existing isDirty Flag on re-storeage on same key', function(done){
    ofm.store(testRoom, "/users/michael/file.txt", "this is the body", true, function(err, res){
        ofm.store(testRoom, "/users/michael/file.txt", "this is the new body", null, function(err, res){
            ofm.isDirty(testRoom, "/users/michael/file.txt", function(err, res){
                should.not.exist(err);
                res.should.equal(true);
                done();
            });
        });
    });
  });//it should  

  it('Should set isDirty Flag', function(done){
    ofm.store(testRoom, "/users/michael/file.txt", "this is the body", true, function(err, res){
        ofm.setIsDirty(testRoom, "/users/michael/file.txt", false, function(err, res){
            ofm.isDirty(testRoom, "/users/michael/file.txt", function(err, res){
                should.not.exist(err);
                res.should.equal(false);
                done();
            });
        });
    });
  });//it should

  it('Should remove an item from file list', function(done){
    ofm.store(testRoom, "/users/michael/file.txt", "this is the body", true, function(err, res){
        ofm.store(testRoom, "/users/michael/file2.txt", "this is the other body", false, function(err, res){
            ofm.remove(testRoom, "/users/michael/file.txt", function(err, res){
                should.not.exist(err);
                ofm.getAll(testRoom, function(err, res){
                    res.length.should.equal(1);
                    res[0].fileName.should.equal('/users/michael/file2.txt');
                    res[0].isDirty.should.equal(false);
                    done();
                });
            });
        });
    });
  });//it should

  it('Should retrieve a full list', function(done){
    ofm.store(testRoom, "/users/michael/afile.txt", "this is the body", true, function(err, res){
        ofm.store(testRoom, "/users/michael/bfile.txt", "this is the other body", false, function(err, res){
            ofm.getAll(testRoom, function(err, res){
                should.not.exist(err);
                res.sort(function(a,b){return a.fileName - b.fileName});
                res.length.should.equal(2);
                res[0].fileName.should.equal('/users/michael/afile.txt');
                res[0].isDirty.should.equal(true);
                res[0].body.should.equal("this is the body");
                res[1].fileName.should.equal('/users/michael/bfile.txt');
                res[1].isDirty.should.equal(false);
                res[1].body.should.equal("this is the other body");
                done();
            });
        });
    });
  });//it should

});//describe
