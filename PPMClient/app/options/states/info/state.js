define([
        'angular',
        'states/info/dependencies'
],
function(angular) {
    var module = angular.module('optionsApp');

    module.config(function($stateProvider, $urlRouterProvider) {
        //any unmatched url will go to info state
        $urlRouterProvider.otherwise("/info");

        $stateProvider
            .state('info', {
                url: '/info',
                controller: 'info.controller',
                templateUrl: 'options/states/info/info.html'
            }
        );
    });
});