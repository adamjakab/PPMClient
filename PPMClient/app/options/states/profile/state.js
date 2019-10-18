define([
        'angular',
        'states/profile/dependencies'
],
function(angular) {
    let module = angular.module('App');

    module.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('profile', {
                url: '/profile',
                controller: 'profile.controller',
                templateUrl: 'options/states/profile/profile.html'
            }
        );
    });
});