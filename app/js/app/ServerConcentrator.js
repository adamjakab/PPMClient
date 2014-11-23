/**
 * PPM Server Concentrator
 */
define([
    'config',
    'app/PPMLogger'
], function (cfg, logger) {
    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {logger.log(msg, "SERVERCONCENTRATOR", type);};

    return {
        initialize: function() {
            log("INITIALIZED", "info");
        }
    };
});
