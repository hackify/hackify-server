var express = require('express'),
  ioSession = require('socket.io-session'),
  sessionStore = new express.session.MemoryStore(),
  passport = require('passport'),
  gitHubStrategy = require('passport-github').Strategy,
  winston = require('winston'),
  uaw = require('./lib/universal-analytics-wrapper'),
  http = require('http'),
  path = require('path'),
  config = require('./config_' + (process.env.NODE_ENV || 'dev')),
  pageRoutes = require('./routes/page'),
  authRoutes = require('./routes/auth'),
  eventRoutes = require('./routes/event'),
  ofm = require('./lib/openfiles_manager_' + ((config.useRedisForOpenFiles)?'redis' :'hash')),
  argv = require('optimist').argv
  ;

//server state
var rooms = {};

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

//*** Passport session setup ***
passport.serializeUser(function(user, done) {
  var userInfo = {
    "userId":user.provider + '|' + user.username,
    "provider":user.provider,
    "displayName":user.displayName,
    "username":user.username,
    "profileUrl":user.profileUrl,
    "emails":user.emails,
    "avatar_url": user._json.avatar_url,
    "gravatar_id": user._json.gravatar_id
  }

  done(null, userInfo); //TODO - users on DB
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);  //TODO - users on DB
});

passport.use(new gitHubStrategy({
    clientID: config.gitHubClientId,
    clientSecret: config.gitHubClientSecret,
    callbackURL: config.callbackURI
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile); //TODO - users on DB
    });
  }
));

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
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.methodOverride());
  app.use(app.router);
});

//*** Main Page routes ***
app.get('/', pageRoutes.index);
app.get('/rooms/:roomId', pageRoutes.room);
app.get('/rooms', pageRoutes.rooms);
app.get('/events', pageRoutes.events);
app.get('/events/:key', pageRoutes.events);

//*** Login, Account and Callback routes ***
app.get('/account', authRoutes.ensureAuthenticated, authRoutes.account);
app.get('/login', authRoutes.login);
app.get('/logout', authRoutes.logout);
app.get('/auth/github',authRoutes.captureReturnTo, passport.authenticate('github'), authRoutes.notCalled);
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), authRoutes.callBack);
app.get('/api/currentuser', authRoutes.currentUser);

//*** event rest api ***
app.get('/api/tags', eventRoutes.getTags);
app.get('/api/events', eventRoutes.getAllEvents);
app.get('/api/events/tagged/:tags', eventRoutes.getEventsByTag);
app.get('/api/events/:key', eventRoutes.get);
app.del('/api/events/:key', eventRoutes.delete);
// app.post('/api/events', authRoutes.ensureAuthenticated, eventRoutes.store);
app.post('/api/events', eventRoutes.store);
app.post('/api/events/:key/comments', eventRoutes.addComment);


//*** bind the express session to socket.io ***
io.set('authorization', ioSession(express.cookieParser(config.siteSecret), sessionStore, function(data, accept){
  return accept(null, true);  //don't require users to be logged in but hook it up to be available to the socket if you are
}));

//*** Room (Socket) routes ***
io.set('log level', 2);
io.sockets.on('connection', function(socket){
  require('./routes/socket_chat').listen(io, socket, rooms);
  require('./routes/socket_code').listen(io, socket, rooms);
  require('./routes/socket_file').listen(io, socket, rooms);
  require('./routes/socket_room').listen(io, socket, rooms);
  require('./routes/socket_roles').listen(io, socket, rooms);
});

//***** Set up the demo room *****
var demoModeratorPass = Math.floor(Math.random() * 999999).toString();
var demoRoom = {
  name: 'demo',
  moderatorPass: demoModeratorPass,
  readOnly: false,
  files: ['demo.js', 'readme.txt'],
  currentFile: "demo.js",
  hostSocket: null,
  authMap: {
    moderator:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':true},
    editor:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':false},
    default:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':false}
  },
  permanent: true
}
rooms['demo'] = demoRoom;
ofm.store('demo', 'demo.js', "var x = 'hackify rules!';", false, function(err,res){});
ofm.store('demo', 'readme.txt', "Hack it up!", false, function(err,res){});

winston.info('demo room created', {moderatorPass: demoModeratorPass});

server.listen(app.get('port'), function () {
  winston.info("hackify server listening", { port: app.get('port') });
});
