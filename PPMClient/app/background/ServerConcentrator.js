/**
 * PPM Server Concentrator
 */
define([
    'syncConfig',
    'PPMLogger',
    'ChromeStorage',
    'ParanoiaServer',
    'bluebird',
    'underscore'
], function (syncConfig, logger, ChromeStorage, ParanoiaServer, Promise, _) {
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

    /**
     * PPM CustomEvent Listener - main event listener
     * DISPATCH CUSTOM EVENT LIKE THIS: UTILS.dispatchCustomEvent({type:"logged_in", ...});
     */
    var customEventListener = function(e) {
        if(e && _.isObject(e.detail)) {
            var eventData = e.detail;
            switch (eventData.type) {
                case "logged_in":
                    log("Caught CustomEvent["+eventData.type+"]");
                    registerServers();
                    break;
                case "logged_out":
                    log("Caught CustomEvent["+eventData.type+"]");
                    unregisterServers();
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


    return {
        /**
         * Initialize component
         * @returns {Promise}
         */
        initialize: function() {
            return new Promise(function (fulfill, reject) {
                document.addEventListener("PPM", customEventListener, false);
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
                log("SHUTDOWN COMPLETED", "info");
                fulfill();
            });
        },

        getRegisteredServerNames: getRegisteredServerNames,
        areAllServersConnected: areAllServersConnected,
        getServerStateByIndex: getServerStateByIndex,
        getServerConfigurationByIndex: getServerConfigurationByIndex,
        connectServer: connectServer,
        disconnectServer: disconnectServer
    };
});
