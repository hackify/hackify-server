var express = require('express'),
  http = require('http'),
  path = require('path'),
  config = require('./config_' + (process.env.NODE_ENV || 'dev')),
  pageRoutes = require('./routes/page')
;

//server state
var rooms = {};

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.configure(function () {
  app.set('port', config.port);
  app.set('views', __dirname + '/views');
  app.engine('html', require('ejs').renderFile);  //I don't love ejs but I hate jade
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({secret: 'joaisduyfoaisduyfo'}));
  app.use(express.methodOverride());
  app.use(app.router);
});

//*** Main Page routes ***
app.get('/', pageRoutes.index);
app.get('/rooms/:roomId', pageRoutes.room);
app.get('/rooms', pageRoutes.rooms);

io.sockets.on('connection', function(socket){
  require('./routes/socket_chat').listen(io, socket, rooms);
  require('./routes/socket_code').listen(io, socket, rooms);
  require('./routes/socket_file').listen(io, socket, rooms);
  require('./routes/socket_room').listen(io, socket, rooms);
});

server.listen(app.get('port'), function () {
  console.log("hackify server listening on Port: " + app.get('port'));
});
