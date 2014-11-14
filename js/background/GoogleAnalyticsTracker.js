/**
 * Tracking functions
 * @param {ParanoiaPasswordManager} PPM
 * @param {object} [options]
 */
function GoogleAnalyticsTracker(PPM, options) {
    var cfg = new ConfigOptions({});
    cfg.merge(options);

    var log = function(msg, type) {PPM.getComponent("LOGGER").log(msg, "GATracker", type);};

    this.init = function() {
        log("INITIALIZED: " + JSON.stringify(cfg.getRecursiveOptions()), "info");
    };
}

