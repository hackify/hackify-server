'use strict';

// Declare app level module which depends on filters, and services

var myApp = angular.module('myApp', [
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',

  // 3rd party dependencies
  'ui.bootstrap',
  'timeRelative'
]);
