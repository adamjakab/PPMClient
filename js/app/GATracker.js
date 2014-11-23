/**
 * Google Analitics usage tracker
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
    var log = function(msg, type) {logger.log(msg, "GAT", type);};

    return {
        initialize: function() {
            log("INITIALIZED", "info");
        }
    };
});