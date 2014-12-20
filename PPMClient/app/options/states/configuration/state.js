define([
        'angular',
        'states/configuration/dependencies'
],
function(angular) {
    var module = angular.module('app');

    module.config(function($stateProvider) {
        $stateProvider
            .state('configuration', {
                url: '/configuration',
                templateUrl: 'options/states/configuration/configuration.html'
            }
        );
    });
});