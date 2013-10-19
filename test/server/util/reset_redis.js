var redis = require("redis"),
    client = redis.createClient(),
    multi = client.multi();

  client.keys("*", function(err, res){
    for(var i = 0; i<res.length; i++){
      console.log('queueing %s for deletion', res[i]);
      multi.del(res[i]);
    }
    multi.exec(function(err, res){
      console.log('err:%s res:%s', err, res);
      return;
    });
  });