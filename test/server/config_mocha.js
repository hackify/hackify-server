//*****useage*******
//var config = require('config_mocha');

console.log('*** using mocha config ***');

exports.socketURL = 'http://localhost:4000';                    //local

//this should probably be in a seperate test utility module as it's not config
exports.doneWithWait = function(done){
  setTimeout(function() {
    done();
  }, 200);
}
