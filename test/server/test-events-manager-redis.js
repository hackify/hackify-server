var should = require('should');
var config = require('./config_mocha');
var mainConfig = require('../../config_' + (process.env.NODE_ENV || 'dev'));
// var em = require('../../lib/events_manager_redis');

describe("Events Manager Test",function(){
  beforeEach(function(done){
    done();
  });

  afterEach(function(done){
    em.reset();

    done();
  });

  // it('Should create a new event', function(done){
  //   var startTime = new Date();

  //   var newEvent = new em.Event('testEvent', 'This is a test', startTime, 'mod123', 'javascript node node.js');

  //   newEvent.key.should.equal('testEvent');
  //   newEvent.description.should.equal('This is a test');
  //   newEvent.startDateTime.should.equal(startTime);
  //   newEvent.moderatorPass.should.equal('mod123');
  //   newEvent.status.should.equal('closed');
    
  //   done(); 
  // });//it should

  // it('Should create a new event with comments', function(done){
  //   var startTime = new Date();

  //   var newEvent = new em.Event('testEvent', 'This is a test', startTime, 'mod123', 'javascript node node.js', [{userName:"bob", comment:"this is my first comment"},{userName:"sally", comment:"I disagree with bob"}]);

  //   newEvent.key.should.equal('testEvent');
  //   newEvent.comments.length.should.equal(2);
  //   newEvent.comments[0].userName.should.equal('bob');
    
  //   done(); 
  // });//it should

  // it('Should store and retrieve an event', function(done){
  //   var startTime = new Date();
  //   var newEvent = new em.Event('testEvent', 'This is a test', startTime, 'mod123', 'javascript node node.js');
  //   em.store(newEvent, function(err, res){
  //       em.getByKey('testEvent', function(retrievedEvent){          
  //           retrievedEvent.key.should.equal('testEvent');
  //           retrievedEvent.description.should.equal('This is a test');
  //           retrievedEvent.startDateTime.getTime().should.equal(startTime.getTime());
  //           retrievedEvent.moderatorPass.should.equal('mod123');
  //           retrievedEvent.status.should.equal('closed');
            
  //           done();         
  //       });
  //   });
  // });//it should

  // it('Should retrieve all events', function(done){
  //   var startTime = new Date();
  //   var newEvent = new em.Event('testEvent', 'This is a test', startTime, 'mod123', 'javascript node node.js');
  //   em.store(newEvent);

  //   var newEvent = new em.Event('test2Event', 'This is 2 a test', startTime, '2mod123', 'javascript node node.js');
  //   em.store(newEvent);

  //   var retrievedEvents = em.getAllEvents();

  //   retrievedEvents.length.should.equal(2);

  //   var retrievedEvent = em.getByKey('test2Event');

  //   retrievedEvent.key.should.equal('test2Event');
  //   retrievedEvent.description.should.equal('This is 2 a test');
  //   retrievedEvent.startDateTime.should.equal(startTime);
  //   retrievedEvent.moderatorPass.should.equal('2mod123');
  //   retrievedEvent.status.should.equal('closed');
    
  //   done(); 
  // });//it should

  // it('Should delete an event', function(done){
  //   var startTime = new Date();
  //   var newEvent = new em.Event('testEvent', 'This is a test', startTime, 'mod123', 'sailing node node.js');
  //   em.store(newEvent);

  //   var newEvent = new em.Event('test2Event', 'This is 2 a test', startTime, '2mod123', 'javascript node dancing');
  //   em.store(newEvent);

  //   em.delete('testEvent')

  //   var retrievedEvents = em.getAllEvents();

  //   retrievedEvents.length.should.equal(1);

  //   var retrievedTags = em.getTags();

  //   retrievedTags.length.should.equal(3);

  //   done(); 
  // });//it should

  // it('Should exist an event', function(done){
  //   var startTime = new Date();
  //   var newEvent = new em.Event('testEvent', 'This is a test', startTime, 'mod123', 'javascript node node.js');
  //   em.store(newEvent);

  //   var newEvent = new em.Event('test2Event', 'This is 2 a test', startTime, '2mod123', 'javascript node node.js');
  //   em.store(newEvent);

  //   em.exists('testEvent').should.equal(true);
  //   em.exists('sillyEvent').should.equal(false);


  //   done(); 
  // });//it should

  // it('Should retrieve events by tag', function(done){
  //   var startTime = new Date();
  //   var newEvent = new em.Event('testEvent', 'This is a test', startTime, 'mod123', 'javascript node node.js');
  //   em.store(newEvent);

  //   var newEvent = new em.Event('test2Event', 'This is 2 a test', startTime, '2mod123', 'dancing node skating');
  //   em.store(newEvent);

  //   var retrievedEvents = em.getEventsByTag(['node']);

  //   retrievedEvents.length.should.equal(2);

  //   var retrievedEvents2 = em.getEventsByTag(['dancing']);

  //   retrievedEvents2.length.should.equal(1);


  //   var retrievedEvent = retrievedEvents2[0];

  //   retrievedEvent.key.should.equal('test2Event');
  //   retrievedEvent.description.should.equal('This is 2 a test');
  //   retrievedEvent.startDateTime.should.equal(startTime);
  //   retrievedEvent.moderatorPass.should.equal('2mod123');
  //   retrievedEvent.status.should.equal('closed');

  //   var retrievedEvents3 = em.getEventsByTag(['javascript', 'skating']);

  //   retrievedEvents3.length.should.equal(2);

  //   var retrievedEvents4 = em.getEventsByTag(['silly']);

  //   retrievedEvents4.length.should.equal(0);

  //   var retrievedEvents5 = em.getEventsByTag(['silly', 'skating']);

  //   retrievedEvents5.length.should.equal(1);

  //   done(); 
  // });//it should

  // it('Should retrieve tags', function(done){
  //   var startTime = new Date();
  //   var newEvent = new em.Event('testEvent', 'This is a test', startTime, 'mod123', 'javascript node node.js');
  //   em.store(newEvent);

  //   var newEvent = new em.Event('test2Event', 'This is 2 a test', startTime, '2mod123', 'dancing node skating');
  //   em.store(newEvent);

  //   var retrievedTags = em.getTags();

  //   retrievedTags.length.should.equal(5);

  //   var findTag = retrievedTags.filter(function (element) { 
  //    return element.tag === 'node';
  //   });

  //   findTag[0].eventCount.should.equal(2);

  //   done(); 
  // });//it should

  // it('Should add comments', function(done){
  //   var startTime = new Date();
  //   var newEvent = new em.Event('testEvent', 'This is a test', startTime, 'mod123', 'javascript node node.js');
  //   em.store(newEvent);

  //   em.addComment('testEvent', {userId:'bob', comment:'the rain in spain'});

  //   var retrievedEvent = em.getByKey('testEvent');

  //   retrievedEvent.comments.length.should.equal(1);
  //   retrievedEvent.comments[0].userId.should.equal('bob');
  //   retrievedEvent.comments[0].comment.should.equal('the rain in spain');

  //   done(); 
  // });//it should


});//describe
