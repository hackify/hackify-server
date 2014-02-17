var winston = require('winston'),
    redis = require("redis"),
    cookie = require('cookie'),
    config = require('../config_' + (process.env.NODE_ENV || 'dev')),
    client = redis.createClient(config.redisPort, config.redisHost);

//http://stevenyue.com/2013/07/04/sharing-sessions-and-authentication-between-rails-and-node-js-using-redis/

module.exports.authorise = function(data, accept){
  if (data.headers.cookie) {
    data.cookie = cookie.parse(data.headers.cookie);
    data.sessionID = data.cookie['_validation_token_key'];
    redis_validate = require('socket.io/node_modules/redis').createClient(6379, "127.0.0.1");
    redis_validate.hget(["mySessionStore", data.sessionID], function (err, session) {
      if (err || !session) {
        return accept(null, true);
      } else {
        // store session data in nodejs server for later use
        data.session = JSON.parse(session);
        return accept(null, true);
      }
    });
  } else {
    return accept(null, true);
  }
}
