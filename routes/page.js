config = require('../config_' + (process.env.NODE_ENV || 'dev'));

module.exports.index = function(req, res){
  res.render('index_view.html', {
    user: req.user,
    gaTrackingId: config.gaTrackingId
  })
};

module.exports.room = function(req, res){
  res.render('room_view.html', {
    user: req.user,
    roomId: req.params.roomId,
    gaTrackingId: config.gaTrackingId
  });
};

module.exports.events = function(req, res){
  res.render('events_view.html', {
    user: req.user,
    gaTrackingId: config.gaTrackingId
  });
};

module.exports.rooms = function(req, res){
  user: req.user,
  res.render('rooms_view.html', {
    gaTrackingId: config.gaTrackingId
  })
};