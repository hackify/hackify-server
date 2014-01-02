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