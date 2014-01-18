var store = {};

module.exports.create = function(room, clientId, userId, userInfo, role, requestedRole, callback){
  store[clientId] = {clientId:clientId, roomName:room, userId:userId, userInfo:userInfo, role:role, requestedRole:requestedRole};
  if(callback) callback(null, 1);
};    

module.exports.getRoom = function(clientId, callback){
  if(store[clientId])
    if(callback) callback(null, store[clientId].roomName);
  else
    if(callback) callback("clientId does not exist", null);
};

module.exports.setRoom = function(clientId, room, callback){
  if(store[clientId])
    store[clientId].roomName = room;
    if(callback) callback(null, true);
  else
    if(callback) callback("clientId does not exist", false);
};

module.exports.getUserId = function(clientId, callback){
  if(store[clientId])
    if(callback) callback(null, store[clientId].userId);
  else
    if(callback) callback("clientId does not exist", null);
};

module.exports.setUserId = function(clientId, userId, callback){
  if(store[clientId])
    store[clientId].userId = userId;
    if(callback) callback(null, true);
  else
    if(callback) callback("clientId does not exist", false);
};

module.exports.getUserInfo = function(clientId, callback){
  if(store[clientId])
    if(callback) callback(null, store[clientId].userInfo);
  else
    if(callback) callback("clientId does not exist", null);
};

module.exports.setUserInfo = function(clientId, userInfo, callback){
  if(store[clientId])
    store[clientId].userInfo = userInfo;
    if(callback) callback(null, true);
  else
    if(callback) callback("clientId does not exist", false);
};

module.exports.getRole = function(clientId, callback){
  if(store[clientId])
    if(callback) callback(null, store[clientId].role);
  else
    if(callback) callback("clientId does not exist", null);
};

module.exports.setRole = function(clientId, role, callback){
  if(store[clientId])
    store[clientId].role = role;
    if(callback) callback(null, true);
  else
    if(callback) callback("clientId does not exist", false);
};

module.exports.getRequestedRole = function(clientId, callback){
  if(store[clientId])
    if(callback) callback(null, store[clientId].requestedRole);
  else
    if(callback) callback("clientId does not exist", null);
};

module.exports.setRequestedRole = function(clientId, requestedRole, callback){
  if(store[clientId])
    store[clientId].requestedRole = requestedRole;
    if(callback) callback(null, true);
  else
    if(callback) callback("clientId does not exist", false);
};

module.exports.remove = function(clientId, callback){
  delete store[clientId];
  if(callback) callback(null, 1);
}

module.exports.get = function(clientId, callback){
  if(store[clientId])
    if(callback) callback(null, store[clientId]);
  else
    if(callback) callback("clientId does not exist", null);
};

//avoided doing an index or compound storage for room specific functions because for local implementations, likely to be only few (or 1) room at a time
module.exports.getAllInRoom = function(room, callback){
  var list = [];
  for(key in store){
    if(store[key].roomName===room){
      list.push(store[key]);
    }
  }  
  if(callback) callback(null, list);
};

module.exports.countMembersInRoom = function(room, callback){
  var counter = 0;
  for(key in store){
    if(store[key].roomName===room){
      counter++;
    }
  }  
  if(callback) callback(null, counter);
};

module.exports.resetRoom = function(room, callback){
  var newStore = {};
  for(key in store){
    if(store[key].roomName!=room){
      newStore[key] = store[key];
    }
  }    
  store = newStore;

  if(callback) callback(null, null);
};