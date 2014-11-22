//Google Analitics usage tracker
/**
 * @type {ConfigOptions} cfg
 * @type {object} logger
 *
 */
define([
    'config',
    'app/PPMLogger'
], function (cfg, logger) {
    var logZone = 'GAT';

    return {
        initialize: function() {
            logger.log("INITIALIZED: " + JSON.stringify(cfg.get("sync.gat")), logZone, "info");
        }
    };
});