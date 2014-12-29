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
     * @type {ConfigurationManager}
     */
    var serverStorage = null;

    /**
     * Storage for
     * @type {ConfigurationManager}
     */
    var secretStorage = null;

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
            for(var i = 0; i < serverCount; i++) {
                var serverIndex = serverNames[i];
                var serverConfig = new ConfigurationManager(syncConfig.get("serverconcentrator.servers."+serverIndex));
                serverConfig.set("index", serverIndex);
                log("Registering server("+serverIndex+")...");
                var server = new ParanoiaServer(serverConfig);
                server.connect();

            }
        } else {
            log("There are no configured servers", "warning");
        }
    };

    /**
     * Disconnects and unregisters all registered servers
     */
    var unregisterServers = function() {

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
        }
    };
});
