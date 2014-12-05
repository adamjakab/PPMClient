/**
 * Popup application
 */
requirejs.config({
    baseUrl: './popup',
    paths: {
        vendor: '../../vendor/js',
        lib: '../lib',
        angular: '../../vendor/js/angular',
        angular_ui_router: '../../vendor/js/angular-ui-router',
        ui_bootstrap: '../../vendor/js/ui-bootstrap',
        underscore: '../../vendor/js/underscore',
        bluebird: '../../vendor/js/bluebird'
    },
    shim: {
        ui_bootstrap: {
            deps: ['angular']
        }
    },
    deps: []
});

require(['dependencies/vendor.dependencies'], function() {
    try {
        //console.log("AngularJs: " + angular.version.full + "("+angular.version.codeName+")");
        require(
            [
                'app.module',
                'dependencies/module.dependencies',
                'dependencies/state.dependencies',
                'dependencies/common.dependencies',
                'dependencies/component.dependencies'
            ], function() {
                angular.bootstrap(document, ['app']);
            }
        );
    } catch(e) {
        console.error("AngularJs is unavailable! ", e);
    }
});
