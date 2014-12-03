/**
 * ParanoiaPasswordManager main application
 */

define([
    'config',
    'PPMLogger',
    'PPMUtils',
    'PPMCryptor',
    'GATracker',
    'ChromeStorage',
    'ServerConcentrator',
    'bluebird'
], function (cfg, logger, utils, cryptor, GATracker, ChromeStorage, ServerConcentrator, Promise) {
    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {logger.log(msg, "PPM", type);};

    return {
        /**
         * todo: should return Promise(for autologin)
         */
        initialize: function() {
            return new Promise(function (fulfill, reject) {
                log("Starting...");
                utils.initialize();
                cryptor.initialize();
                GATracker.initialize();
                ChromeStorage.initialize().then(function () {
                    ServerConcentrator.initialize();
                    fulfill();
                });
            });
        },

        /**
         * Main login interface
         * @param {string} profile
         * @param {string} masterKey
         */
        login: function(profile, masterKey) {
            return new Promise(function (fulfill, reject) {
                ChromeStorage.unlockSyncedStorage(profile, masterKey).then(function () {
                    log("You are now logged in!", "info");
                    log("starting with configuration: " + JSON.stringify(cfg.getAll()));
                    fulfill();
                }).error(function (e) {
                    if(profile && masterKey) {
                        return reject(e);
                    }
                }).catch(Error, function (e) {
                    if(profile && masterKey) {
                        return reject(e);
                    }
                });
            });
        },

        /**
         *
         * @param {string} name
         * @returns {*}
         */
        getComponent: function(name) {
            switch(name) {
                case "LOGGER":
                    return(logger);
                case "UTILS":
                    return(utils);
                case "CRYPTOR":
                    return(cryptor);
                case "GAT":
                    return(GATracker);
                case "CHROMESTORAGE":
                    return(ChromeStorage);
                case "SERVERCONCENTRATOR":
                    return(ServerConcentrator);
                default:
                    return null;
            }
        }


    };
});
