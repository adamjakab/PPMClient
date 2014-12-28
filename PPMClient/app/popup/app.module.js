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
        var app = angular.module('popupApp', config.modules);
        app.value('settings', settings);
        return (app);
    }
);
