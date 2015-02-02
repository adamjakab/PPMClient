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
     * Array of ids of sandboxed iframes
     * @type {string[]}
     */
    var sandboxes = ['encryptionSchemesSandbox'];

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
    //todo: put this inside init func and create remove for it
    document.addEventListener("PPM", customEventListener, false);

    /**
     * We must make sure sandbox apps have been loaded and are ready
     * before we can fire up the application
     */
    var waitForSandboxesToGetReady = function() {
        var checkInterval = null;
        var currentRun = 0;
        var maxRuns = 10;
        log("Waiting for sandboxes to get ready...");

        return new Promise(function (fulfill, reject) {
            var registry = {};
            _.each(sandboxes, function(sandboxName) {
                registry[sandboxName] = false;
            });

            var stopChecks = function() {
                clearInterval(checkInterval);
                checkInterval = null;
                window.removeEventListener('message', checkSandboxMessage);
            };

            var sendHelloToSandboxes = function() {
                currentRun++;
                if(currentRun>maxRuns) {
                    stopChecks();
                    reject(new Error("Sandboxes did not register in due time! Sandbox registry: " + JSON.stringify(registry)));
                }
                var sandbox, data;
                _.each(sandboxes, function(sandboxName) {
                    if(!registry[sandboxName]) {
                        sandbox = document.getElementById(sandboxName);
                        if(!_.isNull(sandbox)) {
                            data = {
                                messageId: sandboxName,
                                domain: 'encryptionSchemes',
                                command: 'HELLO'
                            };
                            sandbox.contentWindow.postMessage(data, "*");
                        }
                    }
                });
            };

            var checkSandboxMessage = function(event) {
                if(!_.isUndefined(event.data)
                    && !_.isUndefined(event.data.messageId)
                    && _.contains(_.keys(registry), event.data.messageId)
                ) {
                    registry[event.data.messageId] = true;
                    log("Registered sandbox: " + event.data.messageId);
                    if(JSON.stringify(_.unique(_.values(registry))) == '[true]') {
                        stopChecks();
                        fulfill();
                    }
                }
            };

            window.addEventListener('message', checkSandboxMessage);
            checkInterval = setInterval(sendHelloToSandboxes,500);
        });
    };

    return {
        /**
         * Inizialize all components
         * @todo: we need to execute these in order
         */
        initialize: function() {
            return new Promise(function (fulfill, reject) {
                waitForSandboxesToGetReady().then(function() {
                    log("Initializing PPM2...");
                    return PPMUtils.initialize();
                }).then(function() {
                    return PPMCryptor.initialize();
                }).then(function() {
                    return GATracker.initialize();
                }).then(function() {
                    return ChromeTabs.initialize();
                }).then(function() {
                    return ChromeStorage.initialize();
                }).then(function() {
                    return ServerConcentrator.initialize();
                }).then(function() {
                    log("PPM2 initialized. Ready.");
                    fulfill();
                }).catch(function (e) {
                    reject(e);
                });
            });
        },

        /**
         * Logout from current profile and shut down all components
         */
        logout: function() {
            return new Promise(function (fulfill, reject) {
                log("Logout request received - shutting down components!", "info");
                ServerConcentrator.shutdown().then(function () {
                    return ChromeStorage.shutdown();
                }).then(function() {
                    return ChromeTabs.shutdown();
                }).then(function() {
                    return GATracker.shutdown();
                }).then(function() {
                    return PPMCryptor.shutdown();
                }).then(function() {
                    return PPMUtils.shutdown();
                }).then(function() {
                    log("All components have been shut down");
                    log("--------------------------------------------------");
                    log("--------------------------------------------------");
                    log("--------------------------------------------------");
                    fulfill();
                }).catch(function (e) {
                    return reject(e);
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
