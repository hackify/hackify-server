var should = require('should');
var config = require('./config_mocha');
var mainConfig = require('../../config_' + (process.env.NODE_ENV || 'dev'));
var fm = require('../../lib/files_manager_redis');

var testRoom = "testroom";

describe("Files Manager Hash Test",function(){
  beforeEach(function(done){
    fm.reset(testRoom, function(err, res){
        done();
    });  
  });

  afterEach(function(done){
    fm.reset(testRoom, function(err, res){
        done();
    });  
  });

  it('Should have an empty test', function(done){
    fm.should.exist;
    done();
  });
  
  it('Should store and retrieve a file', function(done){
    fm.store(testRoom, "/users/michael/file.txt", function(err, res){
        fm.getAll(testRoom, function(err, res){
            should.not.exist(err);
            res.indexOf("/users/michael/file.txt").should.not.equal(-1);
            done();
        });
    });
  });//it should

  it('Should indicate existance', function(done){
    fm.store(testRoom, "/users/michael/file.txt", function(err, res){
        fm.exists(testRoom, "/users/michael/file.txt", function(err, res){
            should.not.exist(err);
            res.should.equal(true);
            fm.exists(testRoom, 'silly.txt', function(err, res){
                should.not.exist(err);
                res.should.equal(false);                
                done();
            })
        });
    });
  });//it should


  it('Should allow re-storeage on same key', function(done){
    fm.store(testRoom, "/users/michael/file.txt", function(err, res){
        fm.store(testRoom, "/users/michael/file.txt", function(err, res){
            fm.getAll(testRoom, function(err, res){
                should.not.exist(err);
                res.length.should.equal(1);
                res[0].should.equal('/users/michael/file.txt')
                done();
            });
        });
    });
  });//it should  

  it('Should remove an item from file list', function(done){
    fm.store(testRoom, "/users/michael/file.txt", function(err, res){
        fm.store(testRoom, "/users/michael/file2.txt", function(err, res){
            fm.remove(testRoom, "/users/michael/file.txt", function(err, res){
                should.not.exist(err);
                fm.getAll(testRoom, function(err, res){
                    res.length.should.equal(1);
                    res[0].should.equal('/users/michael/file2.txt');
                    done();
                });
            });
        });
    });
  });//it should

  it('Should retrieve a full list', function(done){
    fm.store(testRoom, "/users/michael/afile.txt", function(err, res){
        fm.store(testRoom, "/users/michael/bfile.txt", function(err, res){
            fm.getAll(testRoom, function(err, res){
                should.not.exist(err);
                res.sort(function(a,b){return b < a});
                res.length.should.equal(2);
                res[0].should.equal('/users/michael/afile.txt');
                res[1].should.equal('/users/michael/bfile.txt');
                done();
            });
        });
    });
  });//it should

  it('Should default current file to no file', function(done){
    fm.getCurrentFile(testRoom, function(err, res){
      res.should.equal("no file");
      done();
    });
  });//it should

  it('Should set and get current file', function(done){
    fm.setCurrentFile(testRoom, "/users/michael/afile.txt", function(err, res){
      fm.getCurrentFile(testRoom, function(err, res){
        res.should.equal("/users/michael/afile.txt");
        done();
      });
    });
  });//it should

});//describe
