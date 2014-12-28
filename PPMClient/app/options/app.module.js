/**
 * Options Application
 */
define(
    [
        'angular',
        'app.settings',
        'app.config'
    ],
    function (angular, settings, config) {
        var app = angular.module('optionsApp', config.modules);
        app.value('settings', settings);
        return (app);
    }
);
