/**
 * ParanoiaPasswordManager main application
 */

define([
    'PPMLogger',
    'PPMUtils',
    'PPMCryptor',
    'GATracker',
    'ChromeTabs',
    'ChromeStorage',
    'ServerConcentrator',
    'bluebird'
], function (PPMLogger, PPMUtils, PPMCryptor, GATracker, ChromeTabs, ChromeStorage, ServerConcentrator, Promise) {
    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {PPMLogger.log(msg, "PPM", type);};

    /**
     * PPM CustomEvent Listener - listens to events dispatched in background
     */
    var customEventListener = function(e) {
        if(e && _.isObject(e.detail)) {
            var eventData = e.detail;
            switch (eventData.type) {
                case "logged_in":
                    PPMUtils.updateStateIcon(null, "authenticated");
                    break;
                case "logged_out":
                    PPMUtils.updateStateIcon(null, "unauthenticated");
                    break;
                case "server_state_change":
                    var state = ChromeStorage.hasDecryptedSyncData() ? "authenticated" : "unauthenticated";
                    if(state == "authenticated") {
                        state = ServerConcentrator.areAllServersConnected() ? "connected" : "disconnected";
                    }
                    PPMUtils.updateStateIcon(null, state);
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
                    PPMUtils.initialize(),
                    PPMCryptor.initialize(),
                    GATracker.initialize(),
                    ChromeTabs.initialize(),
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
                    PPMUtils.shutdown(),
                    PPMCryptor.shutdown(),
                    GATracker.shutdown(),
                    ChromeTabs.shutdown(),
                    ChromeStorage.shutdown(),
                    ServerConcentrator.shutdown()
                ]).then(function () {
                    log("All components have been shut down");
                    log("--------------------------------------------------");
                    log("--------------------------------------------------");
                    log("--------------------------------------------------");
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
                    return(PPMLogger);
                case "UTILS":
                    return(PPMUtils);
                case "CRYPTOR":
                    return(PPMCryptor);
                case "GAT":
                    return(GATracker);
                case "CHROMETABS":
                    return(ChromeTabs);
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
