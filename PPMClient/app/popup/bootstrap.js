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
    require(['domReady!'], function (document) {
        try {
            angular.bootstrap(document, ['app']);
        } catch(e) {
            console.error("AngularJs is unavailable! ", e);
        }
    });
});
