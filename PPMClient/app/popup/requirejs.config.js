/**
 * Requirejs config
 */

requirejs.config({
    baseUrl: 'popup',
    paths: {
        vendor: '../vendor/js',
        lib: '../lib',
        angular: '../vendor/js/angular',
        angular_ui_router: '../vendor/js/angular-ui-router',
        ui_bootstrap: '../vendor/js/ui-bootstrap',
        underscore: '../vendor/js/underscore',
        bluebird: '../vendor/js/bluebird',
        require: '../vendor/js/require',
        domReady: '../vendor/js/domReady'
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        ui_bootstrap: {
            exports: 'angular',
            deps: ['angular']
        },
        angular_ui_router: {
            exports: 'angular',
            deps: ['angular']
        }
    },
    deps: ['bootstrap']
});
