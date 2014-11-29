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
            url: '/app/popup.html',/* put it back to '/' after */
            templateUrl: versionedUrlFor('popup/states/login/login.html'),
            resolve: stateDependencyResolverFor(stateConfig)
        });
    });
});