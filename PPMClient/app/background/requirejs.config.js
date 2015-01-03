requirejs.config({
    baseUrl: 'background',
    paths: {
        /* PATHS */
        CryptoJs: '../../vendor/crypto-js-evanvosberg/build/rollups',
        CryptoJsComponents: '../../vendor/crypto-js-evanvosberg/build/components',
        /* MODULES */
        underscore: '../../vendor/underscore/underscore',
        bluebird: '../../vendor/bluebird/js/browser/bluebird',
        ConfigurationManager: '../../vendor/configuration-manager/ConfigurationManager',
        localConfig: '../config/localConfig',
        syncConfig: '../config/syncConfig',
        ParanoiaServer: '../lib/ParanoiaServer',
        Passcard: '../lib/Passcard'
    },
    shim: {},
    deps: ['bootstrap']
});
