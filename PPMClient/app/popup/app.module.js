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
        makeModuleLazyLoadable('app');

    }
);
