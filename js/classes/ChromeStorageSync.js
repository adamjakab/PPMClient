/**
 * This object holds the definition(the default values) for PPM SYNC STORAGE DATA
 * that will keep all user settings for the profile
 * all data here will be encrypted(by selected ES) before writing it out
 *
 * TODOS:
 *      1) //we need flag to be able to track if changes were made since last setOption
 *      2) check and push changed configuration data to storage at regular intervals(5/10min) - even though it is saved on logout
 *
 */

/**
 * Local Chrome storage interface
 * @param {ParanoiaPasswordManager} PPM
 * @param {object} [options]
 */
function ChromeStorageSync(PPM, options) {
    /**
     * log interface
     * @param msg
     * @param type
     */
    var log = function(msg, type) {PPM.getComponent("LOGGER").log(msg, "ChromeStorageSync", type);};

    /**
     * Component configuration options
     * @type {ConfigOptions}
     */
    var cfg = new ConfigOptions({
        initialized: false,
        default_profile_name: "DEFAULT",
        default_master_key: "Paranoia",
        storage_profile_name: null,
        storage_profile_master_key: null,
        rawStorageData: null
    }, log);
    cfg.merge(options);

    /**
     * The sync storage default values - all these keys must be present in storage
     * so on initialization this will be merged to current data by adding missing values
     * @type {object}
     */
    var defaultProfileData = {
        //general options
        logincount: 0,
        logindate: "",

        //default server configuration
        srv: {
            0: {
                name: "Paranoia Master Server",
                type: "master",
                url:  "http://localhost:8888",
                username: "your-user-name",
                password: "(:-very_secure_password-:)",
                master_key: "Paranoia",
                ping_interval: 120
            }
        },

        //password generator
        pwgen: {
            length: 32,
            specialchars: '+-_|!$%&([{}])?^*@#.,:;~',
            use_alpha_lower: true,
            use_alpha_upper: true,
            use_numeric: true,
            use_special: true
        },

        //passcard
        passcard: {
            default_username: "",
            autofill_password: true
        }
    };

    /**
     * The storage data for the current profile
     * @type {ConfigOptions}
     */
    var storageData;

    /**
     * @type {ChromeStorageSync}
     */
    var self = this;

    /**
     * Initialize component
     * @param {string|null} profile
     * @param {string|null} masterKey
     * @param {function|null} cb
     */
    this.init = function(profile, masterKey, cb) {
        profile = (profile?profile:cfg.get("default_profile_name"));
        log("INITIALIZED" + JSON.stringify(cfg.getRecursiveOptions()), "info");

        var unlockProfile = function() {
            log("Now trying to unlock profile: " + profile + " with MK: " + masterKey);
        };

        chrome.storage.sync.get(null, function(rawStorageData){
            log("LOADED(RAW): " + JSON.stringify(rawStorageData));
            cfg.set("rawStorageData", rawStorageData);
            var profiles = self.getAvailableProfiles();
            if(profiles.indexOf(profile) == -1) {
                log("The requested profile("+profile+") does not exist!");
                if(profile != cfg.get("default_profile_name")) {
                    log("AVAILABLE PROFILES: " + JSON.stringify(profiles));
                } else {
                    _createAndStoreDefaultProfile(unlockProfile);
                }
            } else {
                unlockProfile();
            }
        });
    };




    this.initOld = function(profile, masterKey, cb) {
        var self = this;
        var settingsObject = null;
        profile = (profile?profile:cfg.get("default_profile_name"));
        log("INITIALIZED" + JSON.stringify(cfg.getRecursiveOptions()), "info");
        chrome.storage.sync.get(null, function(d){
            log("LOADED(RAW): " + JSON.stringify(d));
            cfg.set("rawStorageData", d);


            if(!d.hasOwnProperty(profile)) {
                log("PROFILE["+profile+"] DOES NOT EXIST!");
                if(profile == cfg.get("default_profile_name")) {
                    log("CREATING DEFAULT PROFILE["+profile+"]...");
                    settingsObject = {};
                    cfg.set("storage_profile_name", cfg.get("default_profile_name"));
                    cfg.set("storage_profile_master_key", cfg.get("default_master_key"));
                }
            } else {
                if(masterKey) {
                    var cryptedSettings = d[profile];
                    log("RAW PROFILE DATA["+profile+"]: " + JSON.stringify(cryptedSettings));
                    /** @type PPMCryptor CRYPTOR */
                    var CRYPTOR = PPM.getComponent("CRYPTOR");
                    var so = CRYPTOR.decrypt(cryptedSettings, masterKey, true);
                    log("DECRYPTED PROFILE DATA["+profile+"]: " + JSON.stringify(so));
                    //if (so!==false && typeof(so) == "object") {
                    if (PPM.getComponent("UTILS").getType(so) == "object") {
                        cfg.set("storage_profile_name", profile);
                        cfg.set("storage_profile_master_key", masterKey);
                        settingsObject = so;
                        cfg.set("initialized", true);
                    } else {
                        log("This MasterKey does not open the door!");
                    }
                } else {
                    log("No MK supplied to decrypt profile["+profile+"]!");
                }
            }
            if(settingsObject !== null) {
                if (_checkAndInsertMissingDataKeys(settingsObject)) {
                    log("Loaded data was updated and needs to be saved.");
                    _writeOutStorageData(null);
                }
            } else {
                log("No profile data was loaded!");
            }
            if(PPM.getComponent("UTILS").isFunction(cb)) {cb();}
        });
    };

    /**
     * @param {function} [cb]
     */
    this.shutdown = function(cb) {
        _writeOutStorageData(cb);
    };

    /**
     * Returns true if storage has decrypted data
     * @returns {boolean}
     */
    this.isInited = function() {
        return(cfg.get("initialized", false));
    };

    /**
     * Returns array of available profiles
     * @returns {Array}
     */
    this.getAvailableProfiles = function() {
        var answer = [];
        var rawStorageData = cfg.get("rawStorageData", {});
        if(rawStorageData instanceof ConfigOptions) {
            answer = rawStorageData.getKeys();
        }
        return(answer);
    };

    /**
     * Getter
     * @param key
     * @returns {*}
     */
    this.getOption = function(key) {
        return(storageData.get(key));
    };

    /**
     * Setter
     * @param {string} key
     * @param {*} val
     * @param {function} [cb]
     */
    this.setOption = function(key, val, cb) {
        storageData.set(key, val);
    };

    this.setServerData = function(index, key, val) {
        log("setServerData is disabled!");
        //_setServerData(index, key, val);
    };


    /*------------------------------------------------------------PRIVATE METHODS - */
    /*
    //todo: this is not compatible with ConfigOption class!!!
    var _getOption = function(key) {
        var answer = null;
        if(data.hasOwnProperty(key)) {
            answer = data[key];
        }
        return(answer);
    };

    //todo: this is not compatible with ConfigOption class!!!
    var _setOption = function(key, val) {
        data[key] = val;
        log("SET("+key+"):"+val);
    };

    //todo: this is not compatible with ConfigOption class!!!
    var _setServerData = function(index, key, val) {
        if(!data["srv"].hasOwnProperty(index)) {
            data["srv"][index] = {};
        }
        var server = data["srv"][index];
        server[key] = val;
        log("SET SERVER["+index+"]("+key+"):"+val);
    };
    */

    /**
     * @todo: IMPORTANT - THIS CLASS IS NOT YET FINISHED!!!
     * @todo: use PPMCryptor.md5Hash to confront data
     * Merges locally defined (default) data with loaded data and returns true on change
     * @param localdata
     * @return {boolean}
     */
    var _checkAndInsertMissingDataKeys = function(localdata) {
        var answer = false;
        /*
        for(var k in data) {
            if (data.hasOwnProperty(k) && !localdata.hasOwnProperty(k)) {
                _setOption(k, data[k]);
                answer = true;
            }
        }
        for(k in localdata) {
            if (localdata.hasOwnProperty(k)) {
                data[k] = localdata[k];
            }
        }
        //log("CHECKED DATA: " + JSON.stringify(data));
        */
        return(answer);
    };

    /**
     * Called by init when there is no default profile defined.
     * It creates and stores it by duplicating the defaultProfileData
     * @param {function|null} cb
     */
    var _createAndStoreDefaultProfile = function(cb) {
        storageData = new ConfigOptions(defaultProfileData);
        log("CREATING DEFAULT PROFILE:"+JSON.stringify(storageData.getRecursiveOptions()), "info");
        cfg.set("storage_profile_name", cfg.get("default_profile_name"));
        cfg.set("storage_profile_master_key", cfg.get("default_master_key"));
        _writeOutStorageData(cb);
    };

    /**
     * Writes out to chrome.storage.sync the entire rawStorageData by
     * re-encrypting the current profile data stored in storageData (which could have been modified)
     * @param {function|null} cb
     * @private
     */
    var _writeOutStorageData = function(cb) {
        var currentProfileName = cfg.get("storage_profile_name");
        var CPDSTR = JSON.stringify(storageData.getRecursiveOptions());
        log("CRYPTING CURRENT PROFILE("+currentProfileName+"):"+CPDSTR, "info");
        var CPDENC = PPM.getComponent("CRYPTOR").encrypt(CPDSTR, cfg.get("storage_profile_master_key"));
        var rawStorageData = cfg.get("rawStorageData", new ConfigOptions({}));
        if(rawStorageData instanceof ConfigOptions) {
            rawStorageData.set(currentProfileName, CPDENC);
            var rawStorageDataObject = rawStorageData.getRecursiveOptions();
            log("rawStorageDataObject:"+JSON.stringify(rawStorageDataObject), "info");
            //
            chrome.storage.sync.set(rawStorageDataObject, function() {
                log("SYNC STORAGE ALIGNED!");
                if(PPM.getComponent("UTILS").isFunction(cb)) {cb();}
            });
        } else {
            log("Type error rawStorageData!", "error");
            if(PPM.getComponent("UTILS").isFunction(cb)) {cb();}
        }
    };
}
