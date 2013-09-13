var em = require('../lib/events_manager_' + ((config.redisHost)?'redis' :'hash'));

exports.getAllEvents = function (req, res) {
    res.json(em.getAllEvents());
};

exports.getEventsByTag = function (req, res) {
  res.json(em.getEventsByTag(req.params.tags.split(" ")));
};

//curl -i -H "Accept: application/json" -X DELETE http://localhost:3000/api/rules/reilly-muller-and-koss9729.myshopify.com/anothernew
exports.get = function (req, res) {
  res.json(em.getByKey(req.params.key));
};

exports.getTags = function (req, res) {
  console.log('getting tags');
  res.json(em.getTags());
};

exports.store = function (req, res) {
  var event = req.body;
  em.store(event);
  res.json(event);
};

exports.delete = function(req, res){
  em.delete(req.params.key);
  res.statusCode = 200;
  res.send("OK\n");
};