requirejs.config({
    baseUrl: 'options',
    paths: {
        lib: '../lib',
        angular: '../../vendor/angular/angular',
        angular_ui_router: '../../vendor/angular-ui-router/release/angular-ui-router',
        ui_bootstrap: '../../vendor/angular-ui-bootstrap/dist/ui-bootstrap-0.12.0',
        require: '../../vendor/requirejs/require',
        domReady: '../../vendor/requirejs-domready/domReady',
        underscore: '../../vendor/underscore/underscore',
        bluebird: '../../vendor/bluebird/js/browser/bluebird'
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