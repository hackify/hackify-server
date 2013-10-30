var store = {};
var checkRoom = function(room){
  if(!store[room])
    store[room] = {};
  return;
};

module.exports.store = function(room, fileName, body, isDirty, callback){
  checkRoom(room);
  isDirty = isDirty || ((store[room][fileName])?store[room][fileName].isDirty:false) || false;  // ooh i'm so clevver with my orrrrs
  store[room][fileName] = {body:body, isDirty:isDirty};
  if(callback) callback(null, 1);
};

module.exports.exists = function(room, fileName, callback){
  checkRoom(room);
  if(callback) 
    callback(null, store[room].hasOwnProperty(fileName));
};

module.exports.isDirty = function(room, fileName, callback){
  checkRoom(room);
  if(store[room][fileName])
    if(callback) callback(null, store[room][fileName].isDirty);
  else
    if(callback) callback("file not in list", null);
};

module.exports.setIsDirty = function(room, fileName, isDirty, callback){
  checkRoom(room);
  if(store[room][fileName])
  {
    if(store[room][fileName].isDirty!=isDirty){
      store[room][fileName].isDirty = isDirty;
      if(callback) callback(null, true);      
    }else{
      if(callback) callback(null, false);
    }
  }
  else
    callback("file not in list", null);
};

module.exports.get = function(room, fileName, callback){
  checkRoom(room);
  if(store[room][fileName])
    if(callback) callback(null, store[room][fileName].body);
  else
    if(callback) callback("file not in list", null);
};

module.exports.remove = function(room, fileName, callback){
  checkRoom(room);
  delete store[room][fileName];
  if(callback) callback(null, 1);
}

module.exports.getAll = function(room, callback){
  checkRoom(room);
  var list = [];
  for(key in store[room]){
    list.push({fileName:key, body:store[room][key].body ,isDirty:store[room][key].isDirty});
  }
  callback(null, list);
};

module.exports.reset = function(room, callback){
  checkRoom(room);
  delete store[room];
  if(callback) callback(null, null);
};