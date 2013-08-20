describe( 'controller test', function() {
  var scope;
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

  it('should accept roomReadOnly', function(){
    socketMock.emit('roomReadOnly', true);
    expect(scope.readOnly).toBe(true);
    socketMock.emit('roomReadOnly', false);
    expect(scope.readOnly).toBe(false);
  });

  it('should accept roomAuthMap', function(){
    var testMap = {
      moderator:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':true},
      editor:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':false},
      default:{'editData':false, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': false, 'changeCurrentFile':false, 'changeRole':false}
    };

    socketMock.emit('roomAuthMap', testMap);
    expect(scope.authMap).toBe(testMap);
  });

  it('should accept fileAdded and add file to files list', function(){
    socketMock.emit('fileAdded', '/my/test/file.js');
    expect(scope.files.length).toBe(1);
    expect(scope.files[0]).toBe('/my/test/file.js');
  });

  it('should accept fileDeleted and remove file from files list', function(){
    socketMock.emit('fileAdded', '/my/test/file.js');
    socketMock.emit('fileAdded', '/my/other/test/stuff.css');
    socketMock.emit('fileDeleted', '/my/test/file.js');
    expect(scope.files.length).toBe(1);
    expect(scope.files[0]).toBe('/my/other/test/stuff.css');
  });

  it('should accept refreshData', function(){
    socketMock.emit('refreshData', 'This is the new file data.');
    expect(scope.body).toBe('This is the new file data.');
  });

  it('should accept changeData', function(){
    var testOp = {origin:'+input'};
    socketMock.emit('changeData', testOp);
    expect(scope.newChange).toBe(testOp);
  });

  it('should accept resetHostData and reset all host data', function(){
    socketMock.emit('resetHostData');
    expect(scope.currentFile).toBe('no file');
    expect(scope.files.length).toBe(0);
    expect(scope.body).toBe('');
    expect(scope.warning).toBe('');
  });

  it('should accept newChatMessage and add it to the messages list', function(){
    var flag;

    runs(function() {
      flag = false;

      socketMock.emit('newChatMessage', "Hi my name is bob", 'bob');
      socketMock.emit('newChatMessage', "pleased to meet you, I'm Cindy", 'Cindy Crawford');

      setTimeout(function() {
        socketMock.emit('newChatMessage', "I'm like.. a Model!", 'Cindy Crawford');
        flag = true;
      }, 100);
    });

    waitsFor(function() {
      return flag;
    }, "it should wait to post the last message", 200);

    runs(function() {
      expect(scope.messages.length).toBe(3);
      expect(scope.messages[2].message).toBe("I'm like.. a Model!");
      expect(scope.messages[1].date.getTime()).toBeLessThan(scope.messages[2].date.getTime());
    });
  });

  it('should accept newUser and add it to the users list', function(){
    var testUserInfo = {
      "provider":'github',
      "displayName":'bob',
      "username":'bob the builder',
      "profileUrl":'',
      "emails":'bob@thebuilder.com',
      "avatar_url": '',
      "gravatar_id": ''
    };

    var newUser = {userId:'bob', isYou:false, userInfo:testUserInfo, role:'default'}
    socketMock.emit('newUser', newUser);
    expect(scope.users.length).toBe(1);
    expect(scope.users[0]).toBe(newUser);

  });

  it('should accept newUser that is you and set current user and read only', function(){
    socketMock.emit('roomReadOnly', false);

    var testMap = {
      moderator:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':true},
      editor:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':false},
      default:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': false, 'changeCurrentFile':false, 'changeRole':false}
    };

    socketMock.emit('roomAuthMap', testMap);

    var testUserInfo = {
      "provider":'github',
      "displayName":'bob',
      "username":'bob the builder',
      "profileUrl":'',
      "emails":'bob@thebuilder.com',
      "avatar_url": '',
      "gravatar_id": ''
    };

    var newUser = {userId:'bob', isYou:true, userInfo:testUserInfo, role:'default'}
    socketMock.emit('newUser', newUser);
    expect(scope.currentUser).toBe(newUser);
    expect(scope.readOnly).toBe(false);
    expect(scope.editorOptions.readOnly).toBe(false);
  });

  it('should accept exitingUser and remove user from user list', function(){
    socketMock.emit('newUser', {userId:'bob', isYou:true, userInfo:null, role:'default'});
    socketMock.emit('newUser', {userId:'tara', isYou:true, userInfo:null, role:'default'});
    socketMock.emit('newUser', {userId:'will', isYou:true, userInfo:null, role:'default'});
    socketMock.emit('exitingUser', 'tara');
    expect(scope.users.length).toBe(2);
    expect(scope.users[1].userId).toBe('will');
  });

  it('should accept userIdChanged and change the users name', function(){
    socketMock.emit('newUser', {userId:'bob', isYou:true, userInfo:null, role:'default'});
    socketMock.emit('userIdChanged', 'bob', 'tara');
    expect(scope.users[0].userId).toBe('tara');
  });

  it('should accept userRoleChanged and change the users name', function(){
    socketMock.emit('roomReadOnly', false);

    var testMap = {
      moderator:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':true},
      editor:{'editData':true, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': true, 'changeCurrentFile':true, 'changeRole':false},
      default:{'editData':false, 'newChatMessage':true, 'changeUserId':true, 'saveCurrentFile': false, 'changeCurrentFile':false, 'changeRole':false}
    };

    socketMock.emit('roomAuthMap', testMap);

    socketMock.emit('newUser', {userId:'bob', isYou:true, userInfo:null, role:'default'});
    socketMock.emit('userRoleChanged', 'bob', 'editor');
    expect(scope.users[0].role).toBe('editor');
    expect(scope.editorOptions.readOnly).toBe(false);
  });

  it('should accept requestedRole and change the users requested role', function(){
    socketMock.emit('newUser', {userId:'bob', isYou:true, userInfo:null, role:'default'});
    socketMock.emit('requestedRole', 'bob', 'editor');
    expect(scope.users[0].requestedRole).toBe('editor');
  });

  it('should emit changeCurrentFile when requestChangeCurrentFile is called', function(){
    scope.requestChangeCurrentFile('/test.js');
    //emits['eventName'][#emit][#arg]
    expect(socketMock.emits['changeCurrentFile'][0][0]).toBe('/test.js');
  });

  it('should emit saveCurrentFile when requestSaveCurrentFile is called', function(){
    scope.requestSaveCurrentFile();
    expect(socketMock.emits['saveCurrentFile'].length).toBe(1);
  });

  it('should emit newChatMessage and clear newMessage when newChatMessage is called', function(){
    scope.newMessage = 'Hi my name is Earl.';
    scope.newChatMessage();
    expect(socketMock.emits['newChatMessage'][0][0]).toBe('Hi my name is Earl.');
    expect(scope.newMessage).toBe('');
  });

  it('should emit changeUserId and clear newUserId when changeUserId is called', function(){
    scope.newUserId = 'Earl';
    scope.changeUserId();
    expect(socketMock.emits['changeUserId'][0][0]).toBe('Earl');
    expect(scope.newUserId).toBe('');
  });

  it('should emit grantChangeRole when grantChangeRole is called', function(){
    scope.grantChangeRole('Earl', 'editor');
    expect(socketMock.emits['grantChangeRole'].length).toBe(1);
    expect(socketMock.emits['grantChangeRole'][0][0].userId).toBe('Earl');
    expect(socketMock.emits['grantChangeRole'][0][0].newRole).toBe('editor');
  });

  it('should emit grantChangeRole if the user has a requested role and grantRequestedRole is called', function(){
    var newUser = {userId:'bob', isYou:false, userInfo:null, role:'default'}
    socketMock.emit('newUser', newUser);
    socketMock.emit('requestedRole', 'bob', 'editor');

    scope.grantRequestedRole('bob');

    expect(socketMock.emits['grantChangeRole'].length).toBe(1);
    expect(socketMock.emits['grantChangeRole'][0][0].userId).toBe('bob');
    expect(socketMock.emits['grantChangeRole'][0][0].newRole).toBe('editor');
  });

  it('should emit requestChangeRole when requestChangeRole is called', function(){
    var newUser = {userId:'bob', isYou:false, userInfo:null, role:'default'}
    socketMock.emit('newUser', newUser);

    scope.requestChangeRole('bob', 'editor', 'xxx123');

    expect(socketMock.emits['requestChangeRole'].length).toBe(1);
    expect(socketMock.emits['requestChangeRole'][0][0].userId).toBe('bob');
    expect(socketMock.emits['requestChangeRole'][0][0].newRole).toBe('editor');
    expect(socketMock.emits['requestChangeRole'][0][0].pass).toBe('xxx123');
  });

  it('should emit changeData and refreshData when onEditorChange is called and scope.readOnly is false', function(){
    scope.readOnly = false;
    scope.body = "this is the text";
    var testOp = {op:'op'};

    scope.onEditorChange(0, testOp);

    expect(socketMock.emits['changeData'][0][0]).toBe(testOp);
    expect(socketMock.emits['refreshData'][0][0]).toBe("this is the text");
    expect(socketMock.emits['refreshData'][0][1]).toBe(false);
  });



});

/*
Simple mock for socket.io
see: https://github.com/btford/angular-socket-io-seed/issues/4
thanks to https://github.com/southdesign for the idea
*/
var sockMock = function($rootScope){
  this.events = {};
  this.emits = {};

  // Receive Events
  this.on = function(eventName, callback){
    if(!this.events[eventName]) this.events[eventName] = [];
    this.events[eventName].push(callback);
  }

  // Send Events
  this.emit = function(eventName){
    var args = Array.prototype.slice.call(arguments, 1);

    if(!this.emits[eventName])
      this.emits[eventName] = [];
    this.emits[eventName].push(args);

    if(this.events[eventName]){
      angular.forEach(this.events[eventName], function(callback){
        $rootScope.$apply(function() {
          callback.apply(this, args);
        });
      });
    };
  }
};




