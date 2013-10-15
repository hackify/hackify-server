var should = require('should');
var config = require('./config_mocha');
var mainConfig = require('../../config_' + (process.env.NODE_ENV || 'dev'));
var ofm = require('../../lib/openfiles_manager_hash');

describe("Open Files Manager Test",function(){
  beforeEach(function(done){
    done();
  });

  afterEach(function(done){
    ofm.reset();
    done();
  });

  it('Should store and retrieve an open file', function(done){
    ofm.store("this is the body", "/users/michael/file.txt", true, function(err, res){
        ofm.get("/users/michael/file.txt", function(err, res){
            should.not.exist(err);
            res.should.equal("this is the body");
            done();
        });
    });
  });//it should

  it('Should retrieve a file list', function(done){
    ofm.store("this is the body", "/users/michael/file.txt", true, function(err, res){
        ofm.store("this is the other body", "/users/michael/file2.txt", false, function(err, res){
            ofm.getList(function(err, res){
                should.not.exist(err);
                res.length.should.equal(2);
                res[0].fileName.should.equal('/users/michael/file.txt');
                res[0].isDirty.should.equal(true);
                res[1].fileName.should.equal('/users/michael/file2.txt');
                res[1].isDirty.should.equal(false);

                done();
            });
        });
    });
  });//it should

  it('Should indicate existance', function(done){
    ofm.store("this is the body", "/users/michael/file.txt", true, function(err, res){
        ofm.exists("/users/michael/file.txt", function(err, res){
            should.not.exist(err);
            res.should.equal(true);
            ofm.exists('silly.txt', function(err, res){
                should.not.exist(err);
                res.should.equal(false);                
            })
            done();
        });
    });
  });//it should

  it('Should indicate dirtiness', function(done){
    ofm.store("this is the body", "/users/michael/file.txt", true, function(err, res){
        ofm.isDirty("/users/michael/file.txt", function(err, res){
            should.not.exist(err);
            res.should.equal(true);
            done();
        });
    });
  });//it should

  it('Should allow re-storeage on same key', function(done){
    ofm.store("this is the body", "/users/michael/file.txt", true, function(err, res){
        ofm.store("this is the new body", "/users/michael/file.txt", false, function(err, res){
            ofm.get("/users/michael/file.txt", function(err, res){
                should.not.exist(err);
                res.should.equal("this is the new body");
                done();
            });
        });
    });
  });//it should  

  it('Should store with null isDirty', function(done){
    ofm.store("this is the body", "/users/michael/file.txt", null, function(err, res){
        ofm.isDirty("/users/michael/file.txt", function(err, res){
            should.not.exist(err);
            res.should.equal(false);
            done();
        });
    });
  });//it should

  it('Should use existing isDirty Flag on re-storeage on same key', function(done){
    ofm.store("this is the body", "/users/michael/file.txt", true, function(err, res){
        ofm.store("this is the new body", "/users/michael/file.txt", null, function(err, res){
            ofm.isDirty("/users/michael/file.txt", function(err, res){
                should.not.exist(err);
                res.should.equal(true);
                done();
            });
        });
    });
  });//it should  

  it('Should use set isDirty Flag', function(done){
    ofm.store("this is the body", "/users/michael/file.txt", true, function(err, res){
        ofm.setIsDirty("/users/michael/file.txt", false, function(err, res){
            ofm.isDirty("/users/michael/file.txt", function(err, res){
                should.not.exist(err);
                res.should.equal(false);
                done();
            });
        });
    });
  });//it should

  it('Should remove an item from file list', function(done){
    ofm.store("this is the body", "/users/michael/file.txt", true, function(err, res){
        ofm.store("this is the other body", "/users/michael/file2.txt", false, function(err, res){
            ofm.remove("/users/michael/file.txt", function(err, res){
                should.not.exist(err);
                ofm.getList(function(err, res){
                    res.length.should.equal(1);
                    res[0].fileName.should.equal('/users/michael/file2.txt');
                    res[0].isDirty.should.equal(false);
                    done();
                });
            });
        });
    });
  });//it should

});//describe
