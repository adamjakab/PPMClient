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
        TestUtils: '../../tests/helpers/TestUtils',
        lib: '../lib',
        underscore: '../../vendor/bower/underscore/underscore',
        bluebird: '../../vendor/bower/bluebird/js/browser/bluebird'
    },
    shim: {},
    deps: []
});


//bootstrap karma with spec files
require(['config'], function(cfg) {
    //disable console logging on PPMLogger
    cfg.set("sync.logger.do_console_logging", false);
    require(specs, function() {
        console.log("starting KARMA");
        window.__karma__.start();
    });
});