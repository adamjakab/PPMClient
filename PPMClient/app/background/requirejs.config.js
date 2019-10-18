requirejs.config({
    baseUrl: 'background',
    paths: {
        /* PATHS */
        CryptoJs: '../../vendor/crypto-js',
        /* MODULES */
        underscore: '../../vendor/underscore',
        bluebird: '../../vendor/bluebird',
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
