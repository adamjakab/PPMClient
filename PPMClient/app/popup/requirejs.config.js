requirejs.config({
    baseUrl: 'popup',
    paths: {
        /** PATHS */
        /*vendor: '../../vendor',*/
        sharedServices: '../services',
        /** MODULES */
        angular: '../../vendor/js/angular',
        angular_ui_router: '../../vendor/js/angular-ui-router',
        ui_bootstrap: '../../vendor/js/ui-bootstrap',
        require: '../../vendor/js/require',
        domReady: '../../vendor/js/domReady',
        underscore: '../../vendor/js/underscore',
        bluebird: '../../vendor/js/bluebird',
        ConfigurationManager: '../lib/ConfigurationManager',
        localConfig: '../config/localConfig',
        syncConfig: '../config/syncConfig',
    },
    shim: {
        angular: {
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
