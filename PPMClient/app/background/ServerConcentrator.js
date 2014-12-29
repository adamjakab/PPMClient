/**
 * PPM Server Concentrator
 */
define([
    'syncConfig',
    'PPMLogger',
    'bluebird',
    'underscore'
], function (syncConfig, logger, Promise, _) {
    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {logger.log(msg, "SERVERCONCENTRATOR", type);};

    /**
     * PPM CustomEvent Listener - main event listener
     * DISPATCH CUSTOM EVENT LIKE THIS: UTILS.dispatchCustomEvent({type:"state_change", ...});
     */
    var customEventListener = function(e) {
        if(e && _.isObject(e.detail)) {
            var eventData = e.detail;
            switch (eventData.type) {
                case "logged_in":
                    log("Caught CustomEvent["+eventData.type+"]");
                    break;
            }
        }
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
