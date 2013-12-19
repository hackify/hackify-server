var store = {};
var currentFileStore = {};

var checkRoom = function(room){
  if(!store[room])
    store[room] = [];
  if(!currentFileStore[room])
    currentFileStore[room] = "no file";
  return;
};

module.exports.store = function(room, fileName, callback){
  checkRoom(room);
  if(store[room].indexOf(fileName)==-1){
    store[room].push(fileName);
  }
  
  if(callback) callback(null, 1);
};

module.exports.exists = function(room, fileName, callback){
  checkRoom(room);
  if(callback) 
    callback(null, store[room].indexOf(fileName)>=0);
};

module.exports.remove = function(room, fileName, callback){
  checkRoom(room);
  store[room].splice(store[room].indexOf(fileName), 1);
  if(callback) callback(null, 1);
}

module.exports.getAll = function(room, callback){
  checkRoom(room);
  callback(null, store[room]);
};

module.exports.reset = function(room, callback){
  delete store[room];
  delete currentFileStore[room];
  if(callback) callback(null, null);
};

module.exports.setCurrentFile = function(room, filename, callback){
  checkRoom(room);
  currentFileStore[room] = filename;
  if(callback) callback(null, 1);
}
module.exports.getCurrentFile = function(room, callback){
  checkRoom(room);
  if(callback) callback(null, currentFileStore[room]);
}
