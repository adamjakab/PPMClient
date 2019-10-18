requirejs.config({
    baseUrl: 'background',
    paths: {
        /** PATHS */
        CryptoJs: '../../vendor/js/crypto-js',
        /** MODULES */
        underscore: '../../vendor/js/underscore',
        bluebird: '../../vendor/js/bluebird',
        localConfig: '../config/localConfig',
        syncConfig: '../config/syncConfig',
        ConfigurationManager: '../lib/ConfigurationManager',
        CryptoModule: '../lib/CryptoModule',
        ParanoiaServer: '../lib/ParanoiaServer',
        Passcard: '../lib/Passcard'
    },
    shim: {},
    deps: ['bootstrap']
});
