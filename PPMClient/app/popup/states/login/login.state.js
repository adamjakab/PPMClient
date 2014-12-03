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
            }
        );

        /*
         * Configure other routes only if user is logged in
         */
        var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
        var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
        if(CHROMESTORAGE.isInitialized()) {
            $stateProvider
                .state('logout', {
                    url: '/logout',
                    templateUrl: versionedUrlFor('popup/states/login/logout.html'),
                    resolve: stateDependencyResolverFor(stateConfig)
                }
            );
        }

    });
});