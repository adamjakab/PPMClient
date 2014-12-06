define([
        'angular',
        'lib/stateDependencyResolver'
],
function(angular, stateDependencyResolver)
{
    var module = angular.module('app');

    module.config(function($stateProvider, $urlRouterProvider) {
        //any unmatched url will go to login state
        $urlRouterProvider.otherwise("/login");

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'popup/states/login/login.html',
                resolve: stateDependencyResolver('login')
            })
            .state('logout', {
                url: '/logout',
                templateUrl: 'popup/states/login/logout.html',
                resolve: stateDependencyResolver('login')
            });
    });
});