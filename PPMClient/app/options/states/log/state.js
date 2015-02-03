define([
        'angular',
        'states/log/dependencies'
],
function(angular) {
    var module = angular.module('App');

    module.config(function($stateProvider) {
        $stateProvider
            .state('log', {
                url: '/log',
                controller: 'log.controller',
                templateUrl: 'options/states/log/log.html'
            }
        );
    });
});