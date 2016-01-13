var express = require('express'),
  ioSession = require('socket.io-session'),
  gitHubStrategy = require('passport-github').Strategy,
  winston = require('winston'),
  uaw = require('./lib/universal-analytics-wrapper'),
  http = require('http'),
  path = require('path'),
  config = require('./config_' + (process.env.NODE_ENV || 'dev')),
  pageRoutes = require('./routes/page'),
  ofm = require('./lib/openfiles_manager_' + ((config.useRedisForOpenFiles)?'redis' :'hash')),
  fm = require('./lib/files_manager_' + ((config.useRedisForFiles)?'redis' :'hash')),
  rm = require('./lib/rooms_manager_' + ((config.useRedisForRoomState)?'redis' :'hash')),
  um = require('./lib/users_manager_' + ((config.useRedisForUserState)?'redis' :'hash')),
  sm = require('./lib/session_manager_' + ((config.useRedisForSessionState)?'redis' :'hash')),
  argv = require('optimist').argv,
  async = require('async')
  ;

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

//*** Set up the session store
var sessionStore;
if(config.useRedisForSessionStore){
  var RedisStore = require('connect-redis')(express);
  sessionStore = new RedisStore({
    host:config.redisHost,
    port: config.redisPort,
    pass: config.redisPass
  });
}else{  
  sessionStore = new express.session.MemoryStore();
}

//*** set up the express app ***
app.configure(function () {
  app.set('port', argv.port || process.env.PORT || config.port);
  app.set('views', __dirname + '/views');
  app.engine('html', require('ejs').renderFile);  //I don't love ejs but I hate jade
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.logger('short'));
  app.use(express.cookieParser(config.siteSecret));
  app.use(express.bodyParser());
  app.use(express.session({key: 'connect.sid', store: sessionStore}));
  app.use(uaw.cookieConfigurer(config.gaTrackingId));
  app.use(express.methodOverride());
  app.use(app.router);
});

//*** Main Page routes ***
app.get('/', pageRoutes.index);
app.get('/rooms/:roomId', pageRoutes.room);
app.get('/rooms', pageRoutes.rooms);

//*** set up RedisStore if required ***
if(config.useRedisForSocketIO){
  var RedisStore = require('socket.io/lib/stores/redis'),
      redis  = require('socket.io/node_modules/redis'),
      pub    = redis.createClient(config.redisPort, config.redisHost),
      sub    = redis.createClient(config.redisPort, config.redisHost),
      client = redis.createClient(config.redisPort, config.redisHost)

  if(config.redisPass){
    client.auth(config.redisPass, function (err) { if (err) { throw err} });
    pub.auth(config.redisPass, function (err) { if (err) { throw err} });
    sub.auth(config.redisPass, function (err) { if (err) { throw err} });  
  }

  io.set('store', new RedisStore({redisPub : pub, redisSub : sub, redisClient : client}));     
}

//*** bind the express session to socket.io ***
io.set('authorization', ioSession(express.cookieParser(config.siteSecret), sessionStore, sm.authorise));

//*** Room (Socket) routes ***
io.set('log level', 2);
io.sockets.on('connection', function(socket){
  winston.info('connection', {clientId: socket.id});
  require('./routes/socket_chat').listen(io, socket);
  require('./routes/socket_code').listen(io, socket);
  require('./routes/socket_file').listen(io, socket);
  require('./routes/socket_room').listen(io, socket);
  require('./routes/socket_roles').listen(io, socket);
});

if(!argv.slave){
  rm.getAllRoomNames(function(err, roomNames){
    winston.info('resetting %s rooms', roomNames.length);
    async.forEach(roomNames, function(roomName, callback){
      async.parallel([
          function(callback){ rm.reset(roomName, callback); },
          function(callback){ ofm.reset(roomName, callback); },
          function(callback){ fm.reset(roomName, callback); },
          function(callback){ um.resetRoom(roomName, callback); }
        ], 
        function(err){callback();})//callback for parallel (don't use)
    }, function(err){
      var demoModeratorPass = Math.floor(Math.random() * 999999).toString();
      var demoRoom = {
        name: 'demo',
        moderatorPass: demoModeratorPass,
        readOnly: false,
        hostSocket: null,
        authMap: {
          moderator:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':true},
          editor:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':false},
          default:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':false}
        },
        permanent: true
      }
      rm.set('demo', demoRoom);
      fm.store('demo', 'demo.js', function(err,res){});
      fm.store('demo', 'readme.txt', function(err,res){});
      fm.setCurrentFile('demo', 'demo.js', function(err,res){});
      ofm.store('demo', 'demo.js', "var x = 'hackify rules!';", false, function(err,res){});
      ofm.store('demo', 'readme.txt', "Hack it up!", false, function(err,res){});

      winston.info('demo room created', {moderatorPass: demoModeratorPass});
    });
  });
}else{
  winston.info('slave instance');
}

server.listen(app.get('port'), function () {
  winston.info("hackify server listening", { port: app.get('port') });
});
