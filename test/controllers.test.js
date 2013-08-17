describe( 'controller test', function() {
  beforeEach( angular.mock.module( 'myApp' ) );

  //mock the controller for the same reason and include $rootScope and $controller
  beforeEach(angular.mock.inject(function($rootScope, $controller){
      //create an empty scope
      scope = $rootScope.$new();

      socketMock = new sockMock($rootScope);

      //declare the controller and inject our empty scope
      $controller('AppCtrl', {$scope: scope, socket: socketMock, serverState:{roomName:'testRoom'}});
  })); 

  it('should have variable name = "testRoom"', function(){
    expect(scope.name).toBe('testRoom');
  });

  it('should accept changeCurrentFile file="/myfiles/test.js"', function(){
    socketMock.emit('changeCurrentFile', '/myfiles/test.js', 'text/javascript');
    expect(scope.currentFile).toBe('/myfiles/test.js');
    expect(scope.editorOptions.mode).toBe('text/javascript');
  });

});

/*
Simple mock for socket.io
see: https://github.com/btford/angular-socket-io-seed/issues/4
thanks to https://github.com/southdesign for the idea
*/
var sockMock = function($rootScope){
  this.events = {};

  // Receive Events
  this.on = function(eventName, callback){
    if(!this.events[eventName]) this.events[eventName] = [];
    this.events[eventName].push(callback);
  }

  // Send Events
  this.emit = function(eventName){
    var args = Array.prototype.slice.call(arguments, 1);
    if(this.events[eventName]){
      angular.forEach(this.events[eventName], function(callback){
        $rootScope.$apply(function() {
          callback.apply(this, args);
        });
      });
    };
  }
};






