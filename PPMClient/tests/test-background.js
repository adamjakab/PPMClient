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

//bootstrap karma with spec files
requirejs.config({
    baseUrl: '/base/app/background',
    paths: {
        tests: '../../tests/background',
        lib: '../lib',
        underscore: '../../vendor/bower/underscore/underscore',
        bluebird: '../../vendor/bower/bluebird/js/browser/bluebird'
    },
    shim: {},
    deps: specs,
    callback: window.__karma__.start
});
