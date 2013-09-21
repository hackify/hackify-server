'use strict';

/* Filters */

angular.module('myApp.filters', []).
    filter('interpolate',function (version) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        }
    }).
    filter('reverse', function () {
        return function (items) {
            return items.slice().reverse();
        };
    }).
    filter('timeago', function() {
        return function(date){
            return moment(date).fromNow();
        };
    });