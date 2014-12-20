define([
        'angular',
        'states/log/dependencies'
],
function(angular) {
    var module = angular.module('app');

    module.config(function($stateProvider) {
        $stateProvider
            .state('log', {
                url: '/log',
                templateUrl: 'options/states/log/log.html'
            }
        );
    });
});