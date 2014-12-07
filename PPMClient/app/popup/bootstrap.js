/**
 * Popup Application bootstrap
 */
define([
    'require',
    'app.module',
    'dependencies/vendor.dependencies',
    'dependencies/module.dependencies',
    'dependencies/state.dependencies',
    'dependencies/common.dependencies',
    'dependencies/component.dependencies'
], function(require) {
    console.log("#1-waiting for DOMREADY...");
    require(['domReady!'], function (document) {
        try {
            console.log("#2-firing up angular...");
            angular.bootstrap(document, ['app']);
            console.log("#3-angular is alive.");
        } catch(e) {
            console.error("AngularJs is unavailable! ", e);
        }
    });
});
