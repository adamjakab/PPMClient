define([
    'states/menu/menu.state.config',
    'vendor/versionedUrlFor',
    'vendor/stateDependencyResolverFor'
],
function(stateConfig, versionedUrlFor, stateDependencyResolverFor)
{
    var module = angular.module('app');

    module.config(function($stateProvider) {

        $stateProvider
            .state('menu', {
                url: '/menu',
                templateUrl: versionedUrlFor('popup/states/menu/menu.html'),
                resolve: stateDependencyResolverFor(stateConfig)
            }
        );

    });
});