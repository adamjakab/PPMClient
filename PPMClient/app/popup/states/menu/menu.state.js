define([
    'states/menu/menu.state.config',
    'vendor/versionedUrlFor',
    'vendor/stateDependencyResolverFor'
],
function(stateConfig, versionedUrlFor, stateDependencyResolverFor)
{
    var module = angular.module('app');

    module.config(function($stateProvider) {
        /*
         * Configure other routes only if user is logged in
         */
        var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
        var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
        if(CHROMESTORAGE.isInitialized()) {
            $stateProvider
                .state('menu', {
                    url: '/menu',
                    templateUrl: versionedUrlFor('popup/states/menu/menu.html'),
                    resolve: stateDependencyResolverFor(stateConfig)
                }
            );
        }
    });
});