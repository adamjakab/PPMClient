/**
 * PPM Server Concentrator
 */
define([
    'syncConfig',
    'PPMLogger',
    'ChromeStorage',
    'ParanoiaServer',
    'Passcard',
    'ConfigurationManager',
    'bluebird',
    'underscore'
], function (syncConfig, logger, ChromeStorage, ParanoiaServer, Passcard, ConfigurationManager, Promise, _) {
    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {logger.log(msg, "SERVERCONCENTRATOR", type);};

    /**
     * Storage for registered servers
     * @type {Object}
     */
    var serverStorage = {};

    /**
     * Storage for passcards
     * @type {Object}
     */
    var secretStorage = {};

    var checkIntervalTime = 30 * 1000;
    var checkIntervalRef = null;

    /**
     * Main check function executed on regular intervals to check if any action is needed
     */
    var checkForActions = function() {
        if (ChromeStorage.hasDecryptedSyncData() && areAllServersConnected() && hasSecrets()) {
            var saveList = getOutOfSyncSecretList();
            if(!_.isEmpty(saveList)) {
                log("OOS: " + JSON.stringify(saveList));
                saveSecrets(saveList).then(function() {
                    log("checkForActions finished!");
                });
            } else {
                log("--NO ACTIONS!");
            }
        }
    };

    /**
     * PPM CustomEvent Listener - main event listener
     * DISPATCH CUSTOM EVENT LIKE THIS: UTILS.dispatchCustomEvent({type:"logged_in", ...});
     */
    var customEventListener = function(e) {
        if(e && _.isObject(e.detail)) {
            var eventData = e.detail;
            switch (eventData.type) {
                case "logged_in":
                    //log("Caught CustomEvent["+eventData.type+"]");
                    registerServers();
                    break;
                case "logged_out":
                    //log("Caught CustomEvent["+eventData.type+"]");
                    unregisterServers();
                    break;
                case "server_state_change":
                    if (ChromeStorage.hasDecryptedSyncData() && areAllServersConnected() && !hasSecrets()) {
                        loadSecrets();
                    }
                    break;
                case "passcard_secret_request":
                    if (!_.isUndefined(eventData["id"])) {
                        loadPayloadForSecret(eventData["id"]);
                    }
                    break;
            }
        }
    };

    /**
     * Registers and connects all available servers
     */
    var registerServers = function() {
        var syncConfig = ChromeStorage.getConfigByLocation("sync");
        var serverNames = _.keys(syncConfig.get("serverconcentrator.servers"));
        var serverCount = serverNames.length;
        if(serverCount>0) {
            log("Registering servers(#"+serverCount+")...");
            var connectionPromises = [];
            for(var i = 0; i < serverCount; i++) {
                var serverIndex = serverNames[i];
                var serverConfig = new ConfigurationManager(syncConfig.get("serverconcentrator.servers."+serverIndex));
                serverConfig.set("index", serverIndex);
                log("Registering server("+serverIndex+")...");
                var server = new ParanoiaServer(serverConfig);
                serverStorage[serverIndex] = server;
                connectionPromises.push(server.connect());
                Promise.all(connectionPromises).then(function() {
                    log("All servers are connected.");
                }).catch(function(e) {
                    log("Server cannot be connected! " + e.message, "error");
                });
            }
        } else {
            log("There are no configured servers", "warning");
        }
    };

    /**
     * Disconnects and unregisters all registered servers
     */
    var unregisterServers = function() {
        var disconnectionPromises = [];
        _.each(serverStorage, function(server) {
            disconnectionPromises.push(server.disconnect());
        });
        Promise.all(disconnectionPromises).finally(function() {
            serverStorage = {};
            log("All servers have been disconnected.");
        }).catch(function(e) {
            //well, nobody is perfect
        });
    };

    //----------------------------------------------------------------------------------------------------SERVER STORAGE
    /**
     * @return {Number}
     */
    var getNumberOfRegisteredServers = function() {
        return(getRegisteredServerNames().length);
    };

    /**
     * @return {number}
     */
    var getNumberOfConnectedServers = function() {
        var answer = 0;
        _.each(serverStorage, function(server) {
            var state = server.getServerState();
            answer += (state.connected === true ? 1 : 0);
        });
        return answer;
    };

    var areAllServersConnected = function() {
        return(getNumberOfRegisteredServers() == getNumberOfConnectedServers());
    };

    /**
     * @return {Array}
     * @todo: this should be called getRegisteredServerIndexes
     */
    var getRegisteredServerNames = function() {
        return(_.keys(serverStorage));
    };

    /**
     * @param {string} index
     * @return {ParanoiaServer|Boolean}
     */
    var getServerByIndex = function(index) {
        if (_.contains(getRegisteredServerNames(), index)) {
            return serverStorage[index];
        }
        return false;
    };

    var getServerStateByIndex = function(index) {
        var server = getServerByIndex(index);
        if(server) {
            return(server.getServerState());
        }
        return false;
    };

    var getServerConfigurationByIndex = function(index) {
        if (_.contains(getRegisteredServerNames(), index)) {
            return syncConfig.get("serverconcentrator.servers." + index);
        }
        return false;
    };

    /**
     * Connect a specific registered server
     * @param {string} index
     * @return {Promise}
     */
    var connectServer = function(index) {
        return new Promise(function (fulfill, reject) {
            if (!_.contains(getRegisteredServerNames(), index)) {
                return reject(new Error("No server by this index("+index+") was found!"));
            }
            var server = getServerByIndex(index);
            server.connect().then(function() {
                fulfill();
            }).catch(function(e) {
                log("Unable to connect server! " + e.message, "error");
                return reject(e);
            });
        });
    };

    /**
     * Disconnect a specific registered server
     * @param {string} index
     * @return {Promise}
     */
    var disconnectServer = function(index) {
        return new Promise(function (fulfill, reject) {
            if (!_.contains(getRegisteredServerNames(), index)) {
                return reject(new Error("No server by this index("+index+") was found!"));
            }
            var server = getServerByIndex(index);
            server.disconnect().then(function() {
                fulfill();
            }).catch(function(e) {
                log("Unable to disconnect server! " + e.message, "error");
                return reject(e);
            });
        });
    };

    //----------------------------------------------------------------------------------------------------SECRET STORAGE
    /**
     * @return {Boolean}
     */
    var hasSecrets = function() {
        return(getNumberOfSecrets() != 0);
    };

    /**
     * @return {Object}
     */
    var getSecrets = function() {
        return(secretStorage);
    };

    /**
     * Returns list of IDs where passcards result out of sync
     * @return {Array}
     */
    var getOutOfSyncSecretList = function() {
        var answer = [];
        _.each(secretStorage,
            /**
             * @param {Passcard} pc
             * @param {String} id
             */
            function(pc, id) {
                if(pc.get("sync_state") == 1) {
                    answer.push(id);
                }
            }
        );
        return answer;
    };

    /**
     * Saves all passcards listed in saveList (array of IDs)
     * @param {Array} saveList
     * @return {Promise}
     */
    var saveSecrets = function(saveList) {
        return new Promise(function (fulfill, reject) {
            if(_.isEmpty(saveList)) {
                return reject(new Error("No secrets to save!"));
            }
            Promise.map(saveList, saveSecret, {concurrency: 1}).then(function() {
                log("Finished saving secrets.");
                fulfill();
            }).catch(function(e) {
                log("Secret save failed: " + e.message);
                fulfill();
            });
        });
    };

    /**
     * Saves the passcard identified by id
     * @param {String} id
     * @return {Promise}
     */
    var saveSecret = function(id) {
        return new Promise(function (fulfill, reject) {
            var secret = getSecret(id);
            if(secret === false) {
                return reject(new Error("This secret does not exist!"));
            }
            var server = getServerByIndex("server_0");
            var data = secret.get("save_data");
            server.saveSecret(data).then(function(savedSecretId) {
                log("Secret saved: " + savedSecretId);
                secret.set("sync_state", 0);
                fulfill();
            }).catch(function(e) {
                return reject(e);
            });
        });
    };

    /**
     * @param {String} id
     * @return {Boolean}
     */
    var hasSecret = function(id) {
        return(_.contains(_.keys(secretStorage), id));
    };

    /**
     * @param {String} id
     * @return {Passcard|Boolean}
     */
    var getSecret = function(id) {
        return(hasSecret(id) ? secretStorage[id] : false);
    };

    /**
     * @return {Number}
     */
    var getNumberOfSecrets = function() {
        return(_.keys(secretStorage).length);
    };

    /**
     * Loads all Secrets(all types) from server - only head not payload
     */
    var loadSecrets = function() {
        log("LOADING SECRETS...");
        var loadPromises = [];
        _.each(serverStorage, function(server) {
            loadPromises.push(server.loadIndex());
        });
        Promise.any(loadPromises).then(
            /**
             * @param {Array} INDEX_ARRAY
             */
            function(INDEX_ARRAY) {
                secretStorage = {};
                _.each(INDEX_ARRAY, function(data) {
                    var config = new ConfigurationManager(data);
                    if(config.get("collection") == "passcard") {
                        secretStorage[config.get("_id")] = new Passcard(config);
                    } else {
                        log("Unsupported data type: " + config.get("collection"), "warning")
                    }
                });
                log("NUMBER OF SECRETS LOADED: " + getNumberOfSecrets());
                //log("SECRETS: " + JSON.stringify(secretStorage));
            }
        ).catch(function(e) {
            log("loadSecrets failed: " + e.message);
        });
    };


    var loadPayloadForSecret = function(id) {
        log("LOADING PAYLOAD FOR: " + id);
        var secret = getSecret(id);
        if(secret === false) {
            return reject(new Error("This secret does not exist!"));
        }
        var server = getServerByIndex("server_0");
        server.loadSecret(id).then(function(secretData) {
            //log("Got Secret: " + JSON.stringify(secretData));
            secret.set("data", secretData, true);
            secret.set("has_secret", true);
        }).catch(function(e) {
            log("Could not get payload: " + e.message);
        });
    };

    //------------------------------------------------------------------------------------------------------------------
    return {
        /**
         * Initialize component
         * @returns {Promise}
         */
        initialize: function() {
            return new Promise(function (fulfill, reject) {
                document.addEventListener("PPM", customEventListener, false);
                if (_.isNull(checkIntervalRef)) {
                    checkIntervalRef = setInterval(checkForActions, checkIntervalTime);
                }
                log("INITIALIZED", "info");
                fulfill();
            });
        },

        /**
         * Shut down component
         * @returns {Promise}
         */
        shutdown: function() {
            return new Promise(function (fulfill, reject) {
                document.removeEventListener("PPM", customEventListener, false);
                clearInterval(checkIntervalRef);
                checkIntervalRef = null;
                log("SHUTDOWN COMPLETED", "info");
                fulfill();
            });
        },

        //SERVERS
        getRegisteredServerNames: getRegisteredServerNames,
        areAllServersConnected: areAllServersConnected,
        getServerStateByIndex: getServerStateByIndex,
        getServerConfigurationByIndex: getServerConfigurationByIndex,
        connectServer: connectServer,
        disconnectServer: disconnectServer,
        //SECRETS
        getSecrets: getSecrets,
        getSecret: getSecret
    };
});
