define([
        'angular',
        'states/login/dependencies'
],
function(angular) {
    var module = angular.module('popupApp');

    module.config(function($stateProvider, $urlRouterProvider) {
        //any unmatched url will go to login state
        $urlRouterProvider.otherwise("/login");

        $stateProvider
            .state('login', {
                url: '/login',
                controller: 'login.controller',
                templateUrl: 'popup/states/login/login.html'
            })
            .state('logout', {
                url: '/logout',
                controller: 'login.controller',
                templateUrl: 'popup/states/login/logout.html'
            });
    });
});