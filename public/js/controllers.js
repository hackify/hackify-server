'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('AppCtrl', function ($scope, socket, serverState) {
    $scope.name = serverState.roomName;

    $scope.currentFile = "no file";
    $scope.files = [];
    $scope.bodyStore = {};//muahahahaha
    $scope.messages = [];
    $scope.users = [];
    $scope.readOnly = true;
    $scope.warning = "";

    $scope.newMessage = "";
    $scope.newUserId = "";
    $scope.newChange = null;

    socket.emit('joinRoom', {room: serverState.roomName});

    //***************************
    //***** Socket recievers ****
    //***************************

    //server --> client (notification that the active file has changed, data comes later)
    socket.on('changeCurrentFile', function (file, mimeType) {
      if(file!='no file'){
        if(!$scope.bodyStore[file])
          $scope.bodyStore[file] = {fileName: file, body:"", isDirty:false};

        $scope.currentFile = file;
        $scope.editorOptions.mode = mimeType;        
      }
    });
    
    socket.on('closeFile', function (file) {
      if($scope.bodyStore[file])
        delete $scope.bodyStore[file];
    });

    socket.on('roomReadOnly', function (readOnly) {
      $scope.readOnly = readOnly;
    });

    socket.on('roomAuthMap', function (authMap) {
      $scope.authMap = authMap;
    });

    socket.on('fileAdded', function(file) {
      $scope.files.push(file);
    });

    socket.on('fileDeleted', function(file){
      $scope.files.splice($scope.files.indexOf(file), 1);
    });

    socket.on('fileChanged', function(file){
      //TODO - maybe do something with times... mebe push the last updated time from host and use on UI to 'red' the recently altered.. or order.. not sure
    });

    //server --> client (server sends fresh data for active file)
    socket.on('refreshData', function (body) {
      $scope.bodyStore[$scope.currentFile].body = body;
      $scope.bodyStore[$scope.currentFile].isDirty = false;
    });

    socket.on('syncOpenFile', function (openFile) {
      $scope.bodyStore[openFile.fileName] = openFile;
    });

    socket.on('saveCurrentFile', function (data) {
      $scope.bodyStore[data.file].body = data.body; //if all has gone well, this should do nothing, but it is a point of synchronisation
      $scope.bodyStore[data.file].isDirty = false;
    });

    //server --> client (recieve an incremental operation from the active editor via the server)
    socket.on('changeData', function (data) {
      $scope.bodyStore[$scope.currentFile].isDirty = true;
      $scope.newChange = data;
    });

    socket.on('resetHostData', function(){
      $scope.currentFile = "no file";
      $scope.files = [];
      $scope.bodyStore = {};
      $scope.warning = "";
    });

    socket.on('newChatMessage', function (message, userId) {
      $scope.messages.push({message:message, userId:userId, date:new Date()});
    });

    socket.on('newUser', function(data){
      $scope.users.push(data);
      if(data.isYou==true){
        $scope.currentUser = data;
        checkCurrentUserReadOnly();
      }
    });

    socket.on('exitingUser', function(userId){
      var user = findUser(userId);
      $scope.users.splice($scope.users.indexOf(user), 1);       
    });    

    socket.on('userIdChanged', function(oldUserId, newUserId){
      var user = findUser(oldUserId);
      if(user)
        user.userId = newUserId;      
    });

    socket.on('userRoleChanged', function(userId, newRole){
      var user = findUser(userId);
      if(user){
        user.role = newRole;      
        if(user.isYou)
          checkCurrentUserReadOnly();
      }
    });

    socket.on('requestedRole', function(userId, newRole){
      var user = findUser(userId);
      if(user){
        user.requestedRole = newRole;
      }
    });    

    var findUser = function(userId){
      var foundUser = null;
      $scope.users.forEach(function(user){
        if(user.userId===userId){
          foundUser = user;
        }
      });
      return foundUser;
    };

    //***************************
    //**** make stuff happen ****
    //***************************

    $scope.requestChangeCurrentFile = function(file){    
      socket.emit('changeCurrentFile', file);
    };

    $scope.requestCloseFile = function(file){
      socket.emit('closeFile', file)
    };

    $scope.requestSaveCurrentFile = function(){
      socket.emit('saveCurrentFile');
    };    

    $scope.requestReloadCurrentFile = function(){
      socket.emit('reloadCurrentFile');
    };    

    $scope.newChatMessage = function(){
      socket.emit('newChatMessage', $scope.newMessage);
      $scope.newMessage = "";
    };

    $scope.changeUserId = function(){
      socket.emit('changeUserId', $scope.newUserId);
      $scope.newUserId = "";
    };

    $scope.grantChangeRole = function(userId, newRole){
      socket.emit('grantChangeRole', {userId:userId, newRole:newRole});
    };

    $scope.grantRequestedRole = function(userId){
      var user = findUser(userId);
      if(user && user.requestedRole && user.requestedRole!=""){
        socket.emit('grantChangeRole', {userId:userId, newRole:user.requestedRole});
      }
    };

    $scope.requestChangeRole = function(userId, newRole, pass){
      socket.emit('requestChangeRole', {userId:userId, newRole:newRole, pass:pass});
    };

    var checkCurrentUserReadOnly = function(){
      if($scope.currentUser){
        $scope.editorOptions.readOnly = ($scope.readOnly || !$scope.authMap[$scope.currentUser.role].editData===true);
      }else{
        $scope.editorOptions.readOnly = true;
      }
    };

    //***************************
    //**set up the code editor***
    //***************************

    $scope.onEditorChange = function(i, op){
      if(op.origin && op.origin!=='setValue'){
        if($scope.readOnly){
          $scope.warning = "Your changes will not be shared";
        }else{
          console.log('editor change:' + op);
          socket.emit('changeData', op);
          socket.emit('refreshData', $scope.bodyStore[$scope.currentFile].body, false);//refresh data on server but don't broadcast
          $scope.bodyStore[$scope.currentFile].isDirty = true;
        }
      }
    };

    $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        matchBrackets: true,
        readOnly: true,
        mode: '',
        onChange: $scope.onEditorChange
    };
  });




