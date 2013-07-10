module.exports.index = function(req, res){
  res.render('index_view.html')
};

module.exports.room = function(req, res){
  res.render('room_view.html', {
    roomId: req.params.roomId
  });
};

module.exports.rooms = function(req, res){
  res.render('rooms_view.html')
};