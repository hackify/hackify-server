module.exports.account = function(req, res){
  res.render('account_view.html', { user: req.user });
};

module.exports.login = function(req, res){
  res.render('login_view.html', { user: req.user });
};

module.exports.logout = function(req, res){
  req.logout();
  res.redirect('/');
};

module.exports.notCalled = function(req, res){
  //not called
};

module.exports.callBack = function(req, res) {
  res.redirect('/');
};

module.exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}