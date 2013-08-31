config = require('../config_' + (process.env.NODE_ENV || 'dev'));

module.exports.index = function(req, res){
  res.render('index_view.html', {
    gaTrackingId: config.gaTrackingId
  })
};

module.exports.room = function(req, res){
  res.render('room_view.html', {
    roomId: req.params.roomId,
    gaTrackingId: config.gaTrackingId
  });
};

module.exports.rooms = function(req, res){
  res.render('rooms_view.html', {
    gaTrackingId: config.gaTrackingId
  })
};