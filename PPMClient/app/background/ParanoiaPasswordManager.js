/**
 * ParanoiaPasswordManager main application
 */

define([
    'PPMLogger',
    'PPMUtils',
    'PPMCryptor',
    'GATracker',
    'ChromeStorage',
    'ServerConcentrator',
    'bluebird'
], function (logger, utils, cryptor, GATracker, ChromeStorage, ServerConcentrator, Promise) {
    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {logger.log(msg, "PPM", type);};

    /**
     * PPM CustomEvent Listener - listens to events dispatched in background
     */
    var customEventListener = function(e) {
        if(e && _.isObject(e.detail)) {
            var eventData = e.detail;
            switch (eventData.type) {
                case "logged_in":
                    utils.updateStateIcon(null, "authenticated");
                    break;
                case "logged_out":
                    utils.updateStateIcon(null, "unauthenticated");
                    break;
                case "server_state_change":
                    var state = ChromeStorage.hasDecryptedSyncData() ? "authenticated" : "unauthenticated";
                    if(state == "authenticated") {
                        state = ServerConcentrator.areAllServersConnected() ? "connected" : "disconnected";
                    }
                    utils.updateStateIcon(null, state);
                    break;
            }
        }
    };
    document.addEventListener("PPM", customEventListener, false);

    return {
        /**
         * Inizialize all components
         */
        initialize: function() {
            return new Promise(function (fulfill, reject) {
                log("Starting...");
                Promise.all([
                    utils.initialize(),
                    cryptor.initialize(),
                    GATracker.initialize(),
                    ChromeStorage.initialize(),
                    ServerConcentrator.initialize()
                ]).then(function () {
                    log("All components have been inizialised");
                    fulfill();
                }).error(function (e) {
                    log(e, "error");
                }).catch(Error, function (e) {
                    log(e, "error");
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
         * Logout from current profile
         */
        logout: function() {
            return new Promise(function (fulfill, reject) {
                Promise.all([
                    utils.shutdown(),
                    cryptor.shutdown(),
                    GATracker.shutdown(),
                    ChromeStorage.shutdown(),
                    ServerConcentrator.shutdown()
                ]).then(function () {
                    log("All components have been shut down");
                    fulfill();
                }).error(function (e) {
                    return reject(e);
                }).catch(Error, function (e) {
                    return reject(e);
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
        },

        isLoggedIn: function() {
            return(ChromeStorage.hasDecryptedSyncData());
        }

    };
});
