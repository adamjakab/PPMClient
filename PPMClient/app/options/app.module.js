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
        let app = angular.module('App', config.modules);
        app.value('settings', settings);
        return (app);
    }
);
