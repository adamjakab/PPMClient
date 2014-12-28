define([
        'angular',
        'states/server/dependencies'
],
function(angular) {
    var module = angular.module('optionsApp');

    module.config(function($stateProvider) {
        $stateProvider
            .state('server', {
                url: '/server',
                templateUrl: 'options/states/server/server.html'
            }
        );
    });
});