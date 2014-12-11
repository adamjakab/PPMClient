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
        var app = angular.module('app', config.modules);
        app.value('settings', settings);
        return (app);
    }
);
