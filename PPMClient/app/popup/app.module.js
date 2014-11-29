/**
 * Popup Application
 */
define(
    [
        'vendor/makeModuleLazyLoadable',
        'app.settings',
        'app.config'
    ],
    function (makeModuleLazyLoadable, settings, config) {

        var app = angular.module('app', config.modules);

        app.value('settings', settings);

        app.config(function($locationProvider) {
            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });
        });

        makeModuleLazyLoadable('app');

        app.config(function($urlRouterProvider) {
            if(settings.defaultRoutePath !== undefined) {
                $urlRouterProvider.otherwise(settings.defaultRoutePath);
            }
        });
    }
);
