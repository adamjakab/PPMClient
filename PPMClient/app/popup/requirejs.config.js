requirejs.config({
    baseUrl: 'popup',
    paths: {
        lib: '../lib',
        angular: '../../vendor/bower/angular/angular',
        angular_ui_router: '../../vendor/bower/angular-ui-router/release/angular-ui-router',
        ui_bootstrap: '../../vendor/bower/angular-ui-bootstrap/dist/ui-bootstrap-0.12.0',
        require: '../../vendor/bower/requirejs/require',
        domReady: '../../vendor/bower/requirejs-domready/domReady',
        underscore: '../../vendor/bower/underscore/underscore',
        bluebird: '../../vendor/bower/bluebird/js/browser/bluebird'
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
