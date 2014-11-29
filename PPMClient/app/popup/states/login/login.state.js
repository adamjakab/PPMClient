define([
    'states/login/login.state.config',
    'vendor/versionedUrlFor',
    'vendor/stateDependencyResolverFor'
],
function(stateConfig, versionedUrlFor, stateDependencyResolverFor)
{
    var module = angular.module('app');

    module.config(function($stateProvider)
    {
        $stateProvider.state('login', {
            url: '/app/popup.html',
            templateUrl: versionedUrlFor('popup/states/login/login.html'),
            resolve: stateDependencyResolverFor(stateConfig)
        });

        $stateProvider.state('login2', {
            url: '/app/popup2.html',
            templateUrl: versionedUrlFor('popup/states/login/login2.html'),
            resolve: stateDependencyResolverFor(stateConfig)
        });

    });
});