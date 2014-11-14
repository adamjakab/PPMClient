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
     * Configuration options
     * @type {ConfigOptions}
     */
    var cfg = new ConfigOptions({
        initialized: false,
        default_profile_name: "DEFAULT",
        default_master_key: "Paranoia",
        storage_profile_name: null,
        storage_profile_master_key: null,
        rawStorageData: null
    });
    cfg.merge(options);

    /**
     * The sync storage data default values
     * @type {ConfigOptions}
     */
    var data = new ConfigOptions({
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
    });



    var log = function(msg, type) {PPM.getComponent("LOGGER").log(msg, "ChromeStorageSync", type);};

    /**
     * @param {string|null} profile
     * @param {string|null} masterKey
     * @param {function} cb
     */
    this.init = function(profile, masterKey, cb) {
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
        for (var k in rawStorageData) {
            if(rawStorageData.hasOwnProperty(k)) {
                answer.push(k);
            }
        }
        return(answer);
    };


    this.getOption = function(key) {
        return(_getOption(key));
    };

    this.setOption = function(key, val) {
        _setOption(key, val);
    };

    this.setServerData = function(index, key, val) {
        _setServerData(index, key, val);
    };


    /*------------------------------------------------------------PRIVATE METHODS - */
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

    /**
     * @todo: IMPORTANT - THIS CLASS IS NOT YET FINISHED!!!
     * @todo: use PPMCryptor.md5Hash to confront data
     * Merges locally defined (default) data with loaded data and returns true on change
     * @param localdata
     * @return {boolean}
     */
    var _checkAndInsertMissingDataKeys = function(localdata) {
        var answer = false;
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
        return(answer);
    };

    /**
     * @param cb
     * @private
     */
    var _writeOutStorageData = function(cb) {
        var pdstr = JSON.stringify(data);
        log("WRITING OUT:"+pdstr);
        rawStorageData[storage_profile_name] = PPM.getComponent("CRYPTOR").encrypt(pdstr, storage_profile_master_key);
        //log("WRITING OUT:"+JSON.stringify(o));
        chrome.storage.sync.set(rawStorageData, function() {
            log("SAVED PROFILE("+storage_profile_name+").");
            if(PPM.getComponent("UTILS").isFunction(cb)) {cb();}
        });
    }
}
