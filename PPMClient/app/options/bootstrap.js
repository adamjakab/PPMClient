/**
 * Options Application bootstrap
 */
require([
    'app.module',
    'dependencies/vendor',
    'dependencies/module',
    'dependencies/state',
    'dependencies/common',
    'dependencies/component'
], function() {
    require(['domReady!'], function (document) {
        try {
            angular.bootstrap(document, ['App']);
        } catch(e) {
            console.error("AngularJs is unavailable! ", e);
        }
    });
});
