/**
 * Generic utility methods
 */
define([
    'config',
    'PPMLogger'
], function (cfg, logger) {
    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {logger.log(msg, "UTILS", type);};

    return {
        initialize: function() {
            log("INITIALIZED", "info");
        }
    };
});