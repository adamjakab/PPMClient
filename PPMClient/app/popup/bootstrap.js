/**
 * Popup Application bootstrap
 */
require([
    'app.module',
    'dependencies/vendor',
    'dependencies/module',
    'dependencies/state',
    'dependencies/common',
    'dependencies/component'
], function() {
    console.log("#1-waiting for DOMREADY...");
    require(['domReady!'], function (document) {
        try {
            angular.bootstrap(document, ['app']);
        } catch(e) {
            console.error("AngularJs is unavailable! ", e);
        }
    });
});
