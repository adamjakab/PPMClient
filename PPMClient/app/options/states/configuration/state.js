define([
        'angular',
        'states/configuration/dependencies'
],
function(angular) {
    var module = angular.module('App');

    module.config(function($stateProvider) {
        $stateProvider
            .state('configuration', {
                url: '/configuration',
                controller: 'configuration.controller',
                templateUrl: 'options/states/configuration/configuration.html'
            }
        );
    });
});