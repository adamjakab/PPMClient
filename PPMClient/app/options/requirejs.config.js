requirejs.config({
    baseUrl: 'options',
    paths: {
        /** PATHS */
        /*vendor: '../../vendor',*/
        sharedServices: '../services',
        /** MODULES */
        angular: '../../vendor/js/angular',
        angular_ui_router: '../../vendor/js/angular-ui-router',
        /*ui_bootstrap: '../../vendor/js/ui-bootstrap',*/
        ui_bootstrap: '../../vendor/js/ui-bootstrap-tpls',
        require: '../../vendor/js/require',
        domReady: '../../vendor/js/domReady',
        underscore: '../../vendor/js/underscore',
        bluebird: '../../vendor/js/bluebird',
        ConfigurationManager: '../../vendor/js/Configurator',
        localConfig: '../config/localConfig',
        syncConfig: '../config/syncConfig'
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
