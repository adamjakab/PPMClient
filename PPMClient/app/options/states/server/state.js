define([
        'angular',
        'states/server/dependencies'
],
function(angular) {
    var module = angular.module('App');

    module.config(function($stateProvider) {
        $stateProvider
            .state('server', {
                url: '/server',
                controller: 'server.controller',
                templateUrl: 'options/states/server/server.html'
            }
        );
    });
});