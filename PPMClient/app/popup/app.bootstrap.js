/**
 * Popup application
 */
requirejs.config({
    baseUrl: './popup',
    paths: {
        vendor: '../../vendor/js',
        angular: '../../vendor/js/angular',
        uibootstrap: '../../vendor/js/ui-bootstrap-tpls',
        underscore: '../../vendor/js/underscore',
        bluebird: '../../vendor/js/bluebird'
    },
    shim: {
        uibootstrap: {
            deps: ['angular']
        }
    },
    deps: []
});

require(['dependencies/vendor.dependencies'], function() {
    try {
        console.log("AngularJs: " + angular.version.full + "("+angular.version.codeName+")");
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
        console.log("AngularJs is unavailable! " + e);
    }
});
