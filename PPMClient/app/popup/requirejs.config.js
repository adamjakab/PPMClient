requirejs.config({
    baseUrl: 'popup',
    paths: {
        /** PATHS */
        vendor: '../../vendor',
        sharedServices: '../services',
        /** MODULES */
        angular: '../../vendor/angular',
        angular_ui_router: '../../vendor/angular-ui-router',
        ui_bootstrap: '../../vendor/ui-bootstrap',
        require: '../../vendor/require',
        domReady: '../../vendor/domReady',
        underscore: '../../vendor/underscore',
        bluebird: '../../vendor/bluebird',
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
