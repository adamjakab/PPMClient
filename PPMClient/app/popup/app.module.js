/**
 * Popup Application
 */
define(
    [
        'angular',
        'app.settings',
        'app.config'
    ],
    function (angular, settings, config) {
        var app = angular.module('App', config.modules);
        app.value('settings', settings);
        return (app);
    }
);
