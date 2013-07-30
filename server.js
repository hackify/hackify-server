var express = require('express'),
  ioSession = require('socket.io-session'),
  sessionStore = new express.session.MemoryStore(),
  passport = require('passport'),
  gitHubStrategy = require('passport-github').Strategy,
  winston = require('winston'),
  http = require('http'),
  path = require('path'),
  config = require('./config_' + (process.env.NODE_ENV || 'dev')),
  pageRoutes = require('./routes/page'),
  authRoutes = require('./routes/auth')
;

//server state
var rooms = {};

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

//*** Passport session setup ***
passport.serializeUser(function(user, done) {
  var userInfo = {
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
  app.set('port', config.port);
  app.set('views', __dirname + '/views');
  app.engine('html', require('ejs').renderFile);  //I don't love ejs but I hate jade
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.logger('short'));
  app.use(express.cookieParser(config.siteSecret));
  app.use(express.bodyParser());
  app.use(express.session({key: 'connect.sid', store: sessionStore}));
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(express.methodOverride());
  app.use(app.router);
});

//*** Main Page routes ***
app.get('/', pageRoutes.index);
app.get('/rooms/:roomId', pageRoutes.room);
app.get('/rooms', pageRoutes.rooms);

//*** Login, Account and Callback routes ***
app.get('/account', authRoutes.ensureAuthenticated, authRoutes.account);
app.get('/login', authRoutes.login);
app.get('/logout', authRoutes.logout);
app.get('/auth/github',authRoutes.captureReturnTo, passport.authenticate('github'), authRoutes.notCalled);
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), authRoutes.callBack);

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
  files: ['/demo.js'],
  currentFile: "demo.js",
  body: "var x = 'hack me up!';",
  hostSocket: null,
  authMap: {
    moderator:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':true},
    editor:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': false, 'changeCurrentFile':true, 'changeRole':false},
    default:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':false}
  },
  permanent: true
}
rooms['demo'] = demoRoom;
winston.info('demo room created', {moderatorPass: demoModeratorPass});

server.listen(app.get('port'), function () {
  winston.info("hackify server listening", { port: app.get('port') });
});
