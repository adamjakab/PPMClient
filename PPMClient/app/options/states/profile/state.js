define([
        'angular',
        'states/profile/dependencies'
],
function(angular) {
    var module = angular.module('optionsApp');

    module.config(function($stateProvider, $urlRouterProvider) {
        //any unmatched url will go to info state
        $urlRouterProvider.otherwise("/profile");

        $stateProvider
            .state('profile', {
                url: '/profile',
                controller: 'profile.controller',
                templateUrl: 'options/states/profile/profile.html'
            }
        );
    });
});