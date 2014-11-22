//Generic utility methods
/**
 * @type {ConfigOptions} cfg
 * @type {object} logger
 *
 */
define([
    'config',
    'app/PPMLogger'
], function (cfg, logger) {
    var logZone = 'UTILS';

    return {
        initialize: function() {
            logger.log("INITIALIZED: " + JSON.stringify(cfg.get("sync.utils")), logZone, "info");
        }
    };
});