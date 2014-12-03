define([
    'states/login/login.state.config',
    'vendor/versionedUrlFor',
    'vendor/stateDependencyResolverFor'
],
function(stateConfig, versionedUrlFor, stateDependencyResolverFor)
{
    var module = angular.module('app');

    module.config(function($stateProvider, $urlRouterProvider) {
        //any unmatched url will go to login state
        $urlRouterProvider.otherwise("/login");

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: versionedUrlFor('popup/states/login/login.html'),
                resolve: stateDependencyResolverFor(stateConfig)
            })
            .state('logout', {
                url: '/logout',
                templateUrl: versionedUrlFor('popup/states/login/logout.html'),
                resolve: stateDependencyResolverFor(stateConfig)
            });
    });
});