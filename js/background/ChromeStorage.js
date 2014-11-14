/**
 * Chrome storage interface for both local and synced storage
 * @param {ParanoiaPasswordManager} PPM
 * @param {object} [options]
 */
function ChromeStorage(PPM, options) {
    var cfg = new ConfigOptions({});
    cfg.merge(options);

    /** @type PPMUtils UTILS */
    var UTILS = PPM.getComponent("UTILS");
    /** @type ChromeStorageLocal local_storage */
    var local_storage = null;
    /** @type ChromeStorageSync sync_storage */
    var sync_storage = null;
    var log = function(msg, type) {PPM.getComponent("LOGGER").log(msg, "ChromeStorage", type);};

    this.init = function() {
        log("INITIALIZED: " + JSON.stringify(cfg.getRecursiveOptions()), "info");
    };

    this.shutdown = function(cb) {
        log("shutting down...");
        local_storage.shutdown(function() {
            sync_storage.shutdown(function() {
                UTILS.dispatchCustomEvent({type:"state_change"});
                local_storage = null;
                sync_storage = null;
                if(UTILS.isFunction(cb)) {cb();}
            });
        });
    };

    this.setupLocalAndSyncedStorages = function(profile, masterKey, cb) {
        log("setting up local storage...");
        local_storage = new ChromeStorageLocal(PPM);
        local_storage.init(function() {
            log("setting up sync storage...");
            sync_storage = new ChromeStorageSync(PPM);
            sync_storage.init(profile, masterKey, function() {
                UTILS.dispatchCustomEvent({type:"state_change"});
                if(UTILS.isFunction(cb)) {cb();}
            });
        });
    };

    /**
     * GET STORAGE DATA
     * @param location (local|sync)
     * @param key - Name of the key to get
     * @return {*}
     */
    this.getOption = function(location, key) {
        var answer = false;
        if(location == "local") {
            answer = local_storage.getOption(key);
        } else if (location == "sync") {
            answer = sync_storage.getOption(key);
        }
        return(answer);
    };

    /**
     * SET STORAGE DATA
     * @param {string} location (local|sync)
     * @param {string} key - Name of the key to set
     * @param {*} val - Value of the key to set
     */
    this.setOption = function(location, key, val) {
        if(location == "local") {
            local_storage.setOption(key, val);
        } else if (location == "sync") {
            sync_storage.setOption(key, val);
        }
    };

    /**
     * SET SYNC STORAGE SERVER DATA
     * @param {int} index - The index of the server
     * @param {string} key - Name of the key to set
     * @param {*} val - Value of the key to set
     */
    this.setServerData = function(index, key, val) {
        sync_storage.setServerData(index, key, val);
    };

    /**
     * Returns true if sync_storage has decrypted data
     * @returns {boolean}
     */
    this.isInited = function() {
        return(sync_storage && sync_storage.isInited());
    };

    this.getAvailableProfiles = function() {
        return(sync_storage &&  sync_storage.getAvailableProfiles());
    };


}
