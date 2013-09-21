'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
controller('AppCtrl', function ($scope, $http) {
    $scope.fetchCurrentUser = function(){
      $http.get('/api/currentuser').success(function(user){
        $scope.currentUser = user;
      });
    };

    //pull tags
    $scope.fetchTags = function(){
      $http.get('/api/tags').success(function(tags){
        var min = 12, max = 24, maxCount=0;
        tags.forEach(function(tag){
          if(tag.eventCount > maxCount){
            maxCount=tag.eventCount;
          }
        })

        tags.forEach(function(tag){
          tag.fontSize = (tag.eventCount / maxCount) * (max - min) + min;
        })

        $scope.tags = tags;
      });
    };

    $scope.whereAmI = function(){
      //I did try to use $location but it broke all my urls and was a general pain in the arse so i dropped it.  Don't even get me started on $routeProvider.
      $scope.currentLocation = window.location.href;
      var pathParts = $scope.currentLocation.split("/")
      $scope.currentKey = null;
      if(pathParts.length===5){
        $scope.currentKey = pathParts[4];
      }      
    };

    $scope.fetchEvents = function(){
      if($scope.currentKey !== null){
        $http.get('/api/events/' + $scope.currentKey).success(function(event){
          $scope.events = [event];
        });
      }else{
        $http.get('/api/events').success(function(events){
          $scope.events = events;
        });
      }
    };

    $scope.deleteEvent = function(key){
      $http.delete('/api/events/' + key).success(function(data, status, headers, config){
        $scope.eventSuccess = "event deleted successfully:" + status;
        $scope.fetchTags();
        $scope.fetchEvents();
      }).error(function(data, status, headers, config){
        $scope.eventError = 'problem deleting event:' + status;
      })
    };

    $scope.editEvent = function(event){
      if(!$scope.formEvent) 
        $scope.formEvent = {};

      $scope.formEvent.key = event.key;
      $scope.formEvent.description = event.description;
      $scope.formEvent.startDateTime = event.startDateTime;
      $scope.formEvent.moderatorPass = event.moderatorPass; //note, moderator pass is NOT be passed down to client ... so editing a record requires a entering a new pass
      $scope.formEvent.comments = event.comments;
      $scope.formEvent.status = event.status;
      $scope.formEvent.tagString = event.tags.join(' '); //this is only necessary because I can't bind the array to a string input field.. annoying
    };

    $scope.newEvent = function(){
      if(!$scope.formEvent) 
        $scope.formEvent = {};

      var coeff = 1000 * 60 * 15;
      var date = new Date();  //or use any other date
      var rounded = new Date(Math.round(date.getTime() / coeff) * coeff)
      
      $scope.formEvent.key = '';
      $scope.formEvent.description = '';
      $scope.formEvent.startDateTime = rounded;
      $scope.formEvent.moderatorPass = '';
      $scope.formEvent.comments = [];
      $scope.formEvent.status = 'closed';
      $scope.formEvent.tagString = '';
    };

    $scope.saveExistingEvent = function(){
      var updateEvent = {
        key: $scope.formEvent.key,
        description: $scope.formEvent.description,
        startDateTime: $scope.formEvent.startDateTime,
        moderatorPass: $scope.formEvent.moderatorPass,
        status: $scope.formEvent.status,
        comments: $scope.formEvent.comments,
        tags: $scope.formEvent.tagString.split(' ')
      }

      postEvent(updateEvent);
    };

    $scope.saveNewEvent = function(){
      var newEvent = {
        key: $scope.formEvent.key.trim().replace(/ /g,"_"),
        description: $scope.formEvent.description,
        startDateTime: $scope.formEvent.startDateTime,
        moderatorPass: $scope.formEvent.moderatorPass,
        status: $scope.formEvent.status,
        comments: $scope.formEvent.comments,
        tags: $scope.formEvent.tagString.split(' ')
      }

      postEvent(newEvent, function(){
        $scope.newEvent();
      });
      
    };

    var postEvent = function(event, callback){
      $http.post('/api/events', event).success(function(data, status, headers, config) {
          $scope.eventSuccess = "event posted successfully:" + status;
          $scope.fetchTags();
          $scope.fetchEvents();
          if(callback)
            callback();
        }).error(function(data, status, headers, config) {
          $scope.eventError = 'problem posting event:' + status;
        })
    };

    $scope.addComment = function(key, comment, event){
      var newComment = {userName:$scope.currentUser.username, comment:comment, date:new Date()};

      $http.post('/api/events/' + key + '/comments', newComment).success(function(data, status, headers, config) {
          $scope.commentSuccess = "comment posted successfully:" + status;
          event.comments.push(newComment);
        }).error(function(data, status, headers, config) {
          $scope.commentError = 'problem posting comment:' + status;
        })
    };

    $scope.isInFuture=function(dateToTest){
      var compare = new Date(dateToTest);
      return $scope.currentDate<compare;
    }


    $scope.whereAmI();
    $scope.fetchCurrentUser();
    $scope.fetchTags();
    $scope.fetchEvents();
    $scope.newEvenMinDate = new Date();
    $scope.eventSuccess = null;
    $scope.eventError = null;
    $scope.currentDate = new Date();

  });
