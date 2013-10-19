var em = require('../lib/events_manager_' + ((config.useRedisForEvents)?'redis' :'hash')),
    extend = require('util')._extend;

exports.getAllEvents = function (req, res) {
  var events = em.getAllEvents();
  res.json(cleanEvents(events));
};

exports.getEventsByTag = function (req, res) {
  var events = em.getEventsByTag(req.params.tags.split(" "));
  res.json(cleanEvents(events));
};

var cleanEvents = function(events){
  var eventsClone = [];
  events.forEach(function(event){
    var eventClone = extend({}, event);
    eventClone.moderatorPass = "";
    eventsClone.push(eventClone);
  })

  return eventsClone;
};

exports.get = function (req, res) {
  var eventClone = extend({}, em.getByKey(req.params.key));
  eventClone.moderatorPass = "";
  res.json(eventClone);
};

exports.getTags = function (req, res) {
  res.json(em.getTags());
};

exports.addComment = function (req, res) {
  var comment = req.body;
  var key = req.params.key;

  em.addComment(key, comment);
  res.json(em.getByKey(key));
};

exports.store = function (req, res) {
  var event = req.body;
  if(req.user){
    event.userId = req.user.userId;
    event.userName = req.user.username;    
  }
  em.store(event);
  res.json(event);
};

exports.delete = function(req, res){
  em.delete(req.params.key);
  res.statusCode = 200;
  res.send("OK\n");
};






