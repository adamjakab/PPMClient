define([
        'angular',
        'states/server/dependencies'
],
function(angular) {
    var module = angular.module('app');

    module.config(function($stateProvider) {
        $stateProvider
            .state('server', {
                url: '/server',
                templateUrl: 'options/states/server/server.html'
            }
        );
    });
});