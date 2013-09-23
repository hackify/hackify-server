var winston = require('winston'),
    redis = require("redis"),
    client = redis.createClient();


//return an array containing all event objects 
//return [{key: , description: etc...}]
module.exports.getAllEvents = function(){

};

//clear down all events (testing only i think)
module.exports.reset = function(){

}

//retrieve a list of tags for all events 
//return [{tag:, eventCount: #OfEventsWithThisTag}]
module.exports.getTags = function(){

}

//return an array containing event objects with tags matching the passed findTags array 
//findTags ['tag', 'anothertag']  
//return [{key: , description: etc...}]
module.exports.getEventsByTag = function(findTags){

};

//store an event ensuring tags index is updated
//event {key: , description: etc...}
module.exports.store = function(event, callback){
  client.set(event.key, JSON.stringify(event), function (err, res) {
    callback(err, res);
  });
};

//retrieve a single event by it's key
//return {key: , description: etc...}
module.exports.getByKey = function(key, callback){
  client.get(key, function(err, reply) {
    var retrievedEvent = JSON.parse(reply); //yuck
    retrievedEvent.startDateTime = new Date(retrievedEvent.startDateTime);  //double yuk
    callback(retrievedEvent);
  });  
};

//destroy an event including any indexes
//key 'my_event'
module.exports.delete = function(key){

};

//check for the existence of a key
//key 'my_event'
module.exports.exists = function(key){

};

//add a comment to an existing event
//key 'my_event' comment 'this event is great'
module.exports.addComment = function(key, comment){

}

//simple constructor for the Event data object
module.exports.Event = function(key, description, startDateTime, moderatorPass, tags, comments){
  this.key = key;
  this.description = description;
  this.startDateTime = startDateTime;
  this.moderatorPass = moderatorPass;
  this.status = 'closed';
  this.comments = (comments)?comments:[];
  if(Array.isArray(tags)){
    this.tags = tags
  }else{
    this.tags = tags.split(" ");
  }
};
