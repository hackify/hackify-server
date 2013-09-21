var winston = require('winston');

var store = {};
var tags = {};

module.exports.getAllEvents = function(){
  var events = [];
  for(key in store){
    events.push(store[key]);
  }
  return events;
};

module.exports.reset = function(){
  store = {};
  tags = {};
}

module.exports.getTags = function(){
  foundTags = [];
  for(tag in tags){
    if(tags[tag].length && tags[tag].length > 0){
      foundTags.push({tag:tag, eventCount:tags[tag].length});  
    }
  }
  return foundTags;
}

module.exports.getEventsByTag = function(findTags){
  var events = [];

  findTags.forEach(function(tag){
    if(tags[tag]){
      tags[tag].forEach(function(key){
        if(events.indexOf(store[key]) === -1){
          events.push(store[key]);
        }
      });
      return events;
    }
  });

  return events;
};

module.exports.store = function(event){
  store[event.key] = event;
  event.tags.forEach(function(tag){
    if(tags[tag]){
      if(tags[tag].indexOf(event.key) === -1){
        tags[tag].push(event.key);  
      }
    }else{
      tags[tag] = [event.key];
    }
  });
};

module.exports.getByKey = function(key){
  return store[key];
};

module.exports.delete = function(key){
  if(store[key]){
    var event = store[key];
    event.tags.forEach(function(tag){
      if(tags[tag]){
        if(tags[tag].indexOf(event.key) !== -1){
          tags[tag].splice(tags[tag].indexOf(event.key), 1);
        }
      }
    });  
    delete store[key];    
  }
};

module.exports.exists = function(key){
  if(store[key])
    return true;
  else
    return false;
};

module.exports.addComment = function(key, comment){
  store[key].comments.push(comment);
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
