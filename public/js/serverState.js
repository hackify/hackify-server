/*
 * roomstate passed from the server to the room client
 */

'use strict';

angular.module('myApp.serverState', []).
  factory('serverState', function () {
    return {
      roomName: roomName
    };
  });
