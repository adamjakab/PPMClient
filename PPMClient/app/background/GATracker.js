/**
 * Google Analitics usage tracker
 */
define([
    'config',
    'bluebird',
    'PPMLogger'
], function (cfg, Promise, logger) {
    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {logger.log(msg, "GAT", type);};

    return {
        /**
         * Initialize component
         * @returns {Promise}
         */
        initialize: function() {
            return new Promise(function (fulfill, reject) {
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