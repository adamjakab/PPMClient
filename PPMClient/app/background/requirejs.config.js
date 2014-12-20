requirejs.config({
    baseUrl: 'background',
    paths: {
        /* PATHS */
        lib: '../lib',
        CryptoJs: '../../vendor/crypto-js-evanvosberg/build/rollups',
        CryptoJsComponents: '../../vendor/crypto-js-evanvosberg/build/components',
        /* MODULES */
        underscore: '../../vendor/underscore/underscore',
        bluebird: '../../vendor/bluebird/js/browser/bluebird'
    },
    shim: {},
    deps: ['bootstrap']
});
