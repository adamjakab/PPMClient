//PPM Server Concentrator
/**
 * @type {ConfigOptions} cfg
 * @type {object} logger
 *
 */
define([
    'config',
    'app/PPMLogger'
], function (cfg, logger) {
    var logZone = 'SERVERCONCENTRATOR';

    return {
        initialize: function() {
            logger.log("INITIALIZED: " + JSON.stringify(cfg.get("sync.serverconcentrator")), logZone, "info");
        }
    };
});
