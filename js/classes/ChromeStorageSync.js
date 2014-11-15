/**
 * This object holds the definition(the default values) for PPM SYNC STORAGE DATA
 * that will keep all user settings for the profile
 * all data here will be encrypted(by selected ES) before writing it out
 *
 * TODOS:
 *      1) we need flag to be able to track if changes were made since last setOption
 *      2) check and push changed configuration data to storage at regular intervals(5/10min) - check profile_data_changed
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
        profile_data_changed: false,
        default_profile_name: "DEFAULT",
        default_master_key: "Paranoia",
        storage_profile_name: null,
        storage_profile_master_key: null,
        rawStorageData: null,
        autoSaveInterval: 600
    }, null);//put "log" here for debugging
    cfg.merge(options);

    /**
     * The sync storage default values - all these keys must be present in storage
     * so on initialization this will be merged to current data by adding missing values
     * @type {object}
     */
    var defaultProfileData = {
        //general options
        login_count: 0,
        login_date: "",
        login_ip: "",

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
        log("INITIALIZED: " + JSON.stringify(cfg.getRecursiveOptions()), "info");

        var unlockProfile = function() {
            if(masterKey) {
                var rawStorageData = cfg.get("rawStorageData");
                if(rawStorageData instanceof ConfigOptions) {
                    var CPDENC = rawStorageData.get(profile);
                    log("Trying to decrypt data for profile["+profile+"]...");
                    /** @type PPMCryptor CRYPTOR */
                    var CRYPTOR = PPM.getComponent("CRYPTOR");
                    /** @type PPMUtils UTILS */
                    var UTILS = PPM.getComponent("UTILS");
                    var profileDataObject = CRYPTOR.decrypt(CPDENC, masterKey, true);
                    if(UTILS.isObject(profileDataObject)) {
                        //log("DECRYPTED PROFILE DATA["+profile+"]: " + JSON.stringify(profileDataObject));
                        log("PROFILE DATA DECRYPTED", "info");
                        storageData = new ConfigOptions(profileDataObject);
                        /**
                         * We need to merge possible new keys in defaultProfileData
                         * This can happen when in a new version we introduce additional profile data keys
                         */
                        var hasChanges = storageData.merge(defaultProfileData);
                        //
                        cfg.set("initialized", true);
                        cfg.set("storage_profile_name", profile);
                        cfg.set("storage_profile_master_key", masterKey);
                        cfg.set("profile_data_changed", hasChanges);
                    } else {
                        log("This MasterKey does not open the door!", "error");
                    }
                }
            } else {
                log("No MK supplied to decrypt profile["+profile+"]!");
            }
            if(PPM.getComponent("UTILS").isFunction(cb)) {cb();}
        };

        //load raw data
        chrome.storage.sync.get(null, function(rawStorageData){
            //log("LOADED(RAW): " + JSON.stringify(rawStorageData));
            cfg.set("rawStorageData", rawStorageData);
            var profiles = self.getAvailableProfiles();
            if(profiles.indexOf(profile) == -1) {
                if(profile != cfg.get("default_profile_name")) {
                    log("The requested profile("+profile+") does not exist!", "error");
                    log("AVAILABLE PROFILES: " + JSON.stringify(profiles));
                    if(PPM.getComponent("UTILS").isFunction(cb)) {cb();}
                } else {
                    //must be a first-runner - let's create default profile
                    _createAndStoreDefaultProfile(unlockProfile);
                }
            } else {
                unlockProfile();
            }
        });
    };

    /**
     * @param {function} [cb]
     */
    this.shutdown = function(cb) {
        _writeOutStorageData(cb);
    };

    /**
     * Returns true if storage has been initialized (has decrypted data)
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
        var rawStorageData = cfg.get("rawStorageData");
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
     */
    this.setOption = function(key, val) {
        storageData.set(key, val);
        cfg.set("profile_data_changed", true);
    };


    /*------------------------------------------------------------PRIVATE METHODS - */
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
