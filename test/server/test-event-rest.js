var should = require('should');
var request = require('supertest');
var config = require('./config_mocha');
var mainConfig = require('../../config_' + (process.env.NODE_ENV || 'dev'));
var em = require('../../lib/events_manager_hash');

describe("Events rest Test",function(){
  beforeEach(function(done){
    done();
  });

  afterEach(function(done){
 //    request(config.socketURL)
  // .del('/api/events/testEvent')
  // .end(function(err, res){
    done();  
  // });
});

  it('Should create a new event', function(done){
    var startTime = new Date();

    var newEvent = new em.Event('testEvent', 'This is a test', startTime, 'mod123', 'javascript node node.js');
    
    request(config.socketURL)
    .post('/api/events')
    .send(newEvent)
    .end(function(err, res) {
      if (err) {
        throw err;
      }
          // this is should.js syntax, very clear
          res.should.have.status(200);

          res.body.key.should.equal('testEvent');

          done();
        });
  });//it should

  it('Should create a second new event', function(done){
    var startTime = new Date();

    var newEvent = new em.Event('test2Event', 'This is a 2 test', startTime, '2mod123', 'dancing node skating');
    
    request(config.socketURL)
    .post('/api/events')
    .send(newEvent)
  // .expect('Content-Type', /json/)
  .end(function(err, res) {
    if (err) {
      throw err;
    }
          // this is should.js syntax, very clear
          res.should.have.status(200);

          res.body.key.should.equal('test2Event');

          done();
        });
  });//it should

  it('Should retrieve all events', function(done){    
    request(config.socketURL)
    .get('/api/events')
    .set('Accept', 'application/json')
    .end(function(err, res) {
      if (err) {
        throw err;
      }
          // this is should.js syntax, very clear
          res.should.have.status(200);

          res.body[0].key.should.equal('testEvent');
          res.body.length.should.equal(2);

          done();
        });
  });//it should


  it('Should retrieve events by single tag', function(done){    
    request(config.socketURL)
    .get('/api/events/tagged/javascript')
    .set('Accept', 'application/json')
    .end(function(err, res) {
      if (err) {
        throw err;
      }
          // this is should.js syntax, very clear
          res.should.have.status(200);

          res.body[0].key.should.equal('testEvent');
          res.body.length.should.equal(1);

          done();
        });
  });//it should

  it('Should retrieve events by multiple tags', function(done){
    request(config.socketURL)
    .get('/api/events/tagged/javascript dancing')
    .set('Accept', 'application/json')
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      res.should.have.status(200);

      res.body[0].key.should.equal('testEvent');
      res.body.length.should.equal(2);

      done();
    });
  });//it should

  it('Should retrieve tags', function(done){
    request(config.socketURL)
    .get('/api/tags')
    .set('Accept', 'application/json')
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      res.should.have.status(200);

      res.body[0].tag.should.equal('javascript');
      res.body.length.should.equal(5);

      done();
    });
  });//it should

  it('Should retrieve by key', function(done){
    request(config.socketURL)
    .get('/api/events/test2Event')
    .set('Accept', 'application/json')
    .end(function(err, res) {
      if (err) {
        throw err;
      }
      res.should.have.status(200);

      res.body.key.should.equal('test2Event');

      done();
    });
  });//it should

});//describe