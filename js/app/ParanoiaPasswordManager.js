/**
 * ParanoiaPasswordManager main application
 */
define([
    'config',
    'app/PPMLogger',
    'app/PPMUtils',
    'app/PPMCryptor',
    'app/GATracker',
    'app/ChromeStorage',
    'app/ServerConcentrator'
], function (cfg, logger, utils, cryptor, GATracker, ChromeStorage, ServerConcentrator) {
    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {logger.log(msg, "PPM", type);};

    return {
        initialize: function() {
            log("Starting...");
            utils.initialize();
            cryptor.initialize();
            GATracker.initialize();
            ChromeStorage.initialize();
            ServerConcentrator.initialize();
        },

        /**
         * Main login interface
         * @param {string} [profile]
         * @param {string} [masterKey]
         */
        login: function(profile, masterKey) {
            var setupPromise = ChromeStorage.setupLocalAndSyncedStorages(profile, masterKey);
            setupPromise.then(function () {
                log("You are now logged in!", "info");
                log("starting with configuration: " + JSON.stringify(cfg.getAll()));



            }).error(function (e) {
                //logger.log("Rejected", e, logZone);
            }).catch(Error, function (e) {
                //logger.error("Error", e, logZone);
            });
        }



    };
});
