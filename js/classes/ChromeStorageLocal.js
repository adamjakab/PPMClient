/**
 * Local Chrome storage interface
 * @param {ParanoiaPasswordManager} PPM
 * @param {object} [options]
 */
function ChromeStorageLocal(PPM, options) {
    var cfg = new ConfigOptions({
        "options": {
            "last_selected_tab": "passcards"
        },
        "popup": {}
    });
    cfg.merge(options);

    var log = function(msg, type) {PPM.getComponent("LOGGER").log(msg, "ChromeStorageLocal", type);};

    /**
     * Init local storage
     * @param {function} [cb]
     */
    this.init = function(cb) {
        log("INITIALIZED", "info");
        chrome.storage.local.get(null, function(localStorageData){
            log("Loaded LocalStorageData:" + JSON.stringify(localStorageData));
            _checkAndInsertMissingDataKeys(localStorageData, function() {
                log("Merged configuration: " + JSON.stringify(cfg.getRecursiveOptions()), "info");
                if(PPM.getComponent("UTILS").isFunction(cb)) {cb();}
            });
        });
    };

    /**
     * Shutdown local storage
     * todo: remove _storeConfiguration from setter
     *      and store cfg on shutdown
     *      + every n minutes if changed
     * @param {function} [cb]
     */
    this.shutdown = function(cb) {
        if(PPM.getComponent("UTILS").isFunction(cb)) {cb();}
    };

    /**
     * Getter
     * @param key
     * @returns {*}
     */
    this.getOption = function(key) {
        return(cfg.get(key));
    };

    /**
     * Setter
     * @param {string} key
     * @param {*} val
     * @param {function} [cb]
     */
    this.setOption = function(key, val, cb) {
        cfg.set(key, val);
        _storeConfiguration(cb);
    };


    /**
     * Merge predefined configuration data with loaded localStorageData
     * and save it back to local storage right away
     * @param {object} localStorageData
     * @param {function} [cb]
     * @private
     */
    var _checkAndInsertMissingDataKeys = function(localStorageData, cb) {
        cfg.merge(localStorageData);
        _storeConfiguration(cb);
    };

    /**
     * Store entire configuration to local storage
     * @param {function} [cb]
     * @private
     */
    var _storeConfiguration = function(cb) {
        chrome.storage.local.set(cfg.getRecursiveOptions(), function() {
            if(PPM.getComponent("UTILS").isFunction(cb)) {cb();}
        });
    }
}
