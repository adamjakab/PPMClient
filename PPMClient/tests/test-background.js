/* Background tests bootstrap*/

//define test spec files to be loaded
var specs = [];
for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
        if (/Spec\.js$/.test(file)) {
            specs.push(file);
        }
    }
}
//console.log("SPECS: " + JSON.stringify(specs));

requirejs.config({
    baseUrl: '/base/app/background',
    paths: {
        /* PATHS */
        TestUtils: '../../tests/helpers/TestUtils',
        CryptoJs: '../../vendor/crypto-js-evanvosberg/build/rollups',
        CryptoJsComponents: '../../vendor/crypto-js-evanvosberg/build/components',
        /* MODULES */
        underscore: '../../vendor/underscore/underscore',
        bluebird: '../../vendor/bluebird/js/browser/bluebird',
        ConfigurationManager: '../../vendor/configuration-manager/ConfigurationManager',
        localConfig: '../config/localConfig',
        syncConfig: '../config/syncConfig'
    },
    shim: {
    },
    deps: []
});


//bootstrap karma with spec files
require(['syncConfig'], function(syncConfig) {
    //disable console logging on PPMLogger
    syncConfig.set("logger.do_console_logging", false);
    require(specs, function() {
        window.__karma__.start();
    });
});