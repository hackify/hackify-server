var ua = require('universal-analytics');
var gaTrackingIdlocal;

module.exports.cookieConfigurer = function(gaTrackingId) {
    gaTrackingIdlocal = gaTrackingId;

    return function cookieConfigurer(req, res, next) {
        if(req.session && (!req.session.cid) && req.cookies._ga){
            //Use the cid already embedded in the _ga cookie and save to session
            var gaSplit = req.cookies._ga.split('.');
            req.session.cid = gaSplit[2] + "." + gaSplit[3];
        };
        next();
    }
};

module.exports.getVisitor = function(session){
    if(session && session.cid){
        return ua(gaTrackingIdlocal, session.cid);
    }	
}