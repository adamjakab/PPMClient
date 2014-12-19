requirejs.config({
    baseUrl: 'background',
    paths: {
        /* PATHS */
        lib: '../lib',
        CryptoJs: '../../vendor/bower/crypto-js-evanvosberg/build/rollups',
        CryptoJsComponents: '../../vendor/bower/crypto-js-evanvosberg/build/components',
        /* MODULES */
        underscore: '../../vendor/bower/underscore/underscore',
        bluebird: '../../vendor/bower/bluebird/js/browser/bluebird',


    },
    shim: {},
    deps: ['bootstrap']
});
