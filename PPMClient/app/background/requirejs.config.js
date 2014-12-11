requirejs.config({
    baseUrl: './background',
    paths: {
        lib: '../lib',
        underscore: '../../vendor/bower/underscore/underscore',
        bluebird: '../../vendor/bower/bluebird/js/browser/bluebird'
    },
    shim: {},
    deps: ['bootstrap']
});
