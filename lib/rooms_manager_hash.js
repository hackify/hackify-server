var roomStore = {};

module.exports.set = function(room, roomState, callback){
  roomStore[room] = roomState;
  if(callback) callback(null, 1);
}

module.exports.get = function(room, callback){
  if(callback) callback(null, roomStore[room]);
}

module.exports.reset = function(room, callback){
  delete roomStore[room];
  if(callback) callback(null, null);
};

module.exports.getAllRoomNames = function(callback){
  var list=[];
  for(key in roomStore){
    list.push(key);
  }
  if(callback) callback(null, list);
};

module.exports.exists = function(room, callback){
  if(callback){
    if(roomStore[room]){
      callback(null, true);
    }else{
      callback(null, false);
    }
    
  }
};