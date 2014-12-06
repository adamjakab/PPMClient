/**
 * Popup Application
 */
define(
    [
        'angular',
        'app.settings',
        'app.config',
        'lib/makeModuleLazyLoadable'
    ],
    function (angular, settings, config, makeModuleLazyLoadable) {
        var app = angular.module('app', config.modules);
        app.value('settings', settings);
        makeModuleLazyLoadable('app');
    }
);
