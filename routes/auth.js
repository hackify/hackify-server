config = require('../config_' + (process.env.NODE_ENV || 'dev'));

module.exports.account = function(req, res){
  res.render('account_view.html', { 
    user: req.user,
    gaTrackingId: config.gaTrackingId
  });
};

module.exports.currentUser = function(req, res){
  res.json(req.user);
}

module.exports.login = function(req, res){
  res.render('login_view.html', { 
    user: req.user,
    gaTrackingId: config.gaTrackingId
  });
};

module.exports.logout = function(req, res){
  req.logout();
  res.redirect('/');
};

module.exports.notCalled = function(req, res){
  //not called
};

module.exports.callBack = function(req, res) {
  if(req.session && req.session.returnTo){
    res.redirect(req.session.returnTo);
  }else{
    res.redirect('/');
  }
};

module.exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

module.exports.captureReturnTo = function(req, res, next){
  if(req.session && req.query.returnTo){
    req.session.returnTo = req.query.returnTo;
  }
  return next();
};