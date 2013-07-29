'use strict';

/* Directives */

angular.module('myApp.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }).
  directive('scrollToBottom', function(){
    return {
      restrict: 'A',
      link: function(scope, elm, attrs){
        scope.$watch(attrs.scrollToBottom, function(nVal) { 
          elm[0].scrollTop = elm[0].scrollHeight; 
        }, true);
      }
    }
  });
