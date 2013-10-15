var winston = require('winston');

var store = {};

module.exports.store = function(body, fileName, isDirty, callback){
  winston.info('store:%s', fileName);
  isDirty = isDirty || ((store[fileName])?store[fileName].isDirty:false) || false;  // ooh i'm so clevver with my orrrrs
  store[fileName] = {body:body, isDirty:isDirty};
  module.exports.getList(callback);
};

module.exports.exists = function(fileName, callback){
  if(store[fileName])
    callback(null, true);
  else
    callback(null, false);
};

module.exports.isDirty = function(fileName, callback){
  if(store[fileName])
    callback(null, store[fileName].isDirty);
  else
    callback("file not in list", null);
};

module.exports.setIsDirty = function(fileName, isDirty, callback){
  if(store[fileName])
  {
    if(store[fileName].isDirty!=isDirty){
      store[fileName].isDirty = isDirty;
      callback(null, true);      
    }else{
      callback(null, false);
    }
  }
  else
    callback("file not in list", null);
};

module.exports.get = function(fileName, callback){
  winston.info('get fileName:%s', fileName);
  if(store[fileName])
    callback(null, store[fileName].body);
  else
    callback("file not in list", null);
};

module.exports.remove = function(fileName, callback){
  delete store[fileName];
  module.exports.getList(callback);
}

module.exports.getList = function(callback){
  var list = [];
  for(key in store){
    list.push({fileName:key, isDirty:store[key].isDirty});
  }
  callback(null, list);
};

module.exports.reset = function(){
  store = {};
};