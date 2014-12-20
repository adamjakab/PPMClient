/**
 * Chrome Storage (local + sync)
 */
define([
    'config',
    'PPMLogger',
    'PPMCryptor',
    'bluebird',
    'underscore'
], function (cfg, logger, cryptor, Promise, _) {
    /**
     * @type {object} rawSyncStorageData
     */
    var rawSyncStorageData;

    /**
     * @type {string}
     */
    var defaultProfileName =  "DEFAULT";

    /**
     * @type {string}
     */
    var defaultMasterKey =  "Paranoia";

    /**
     * @type {string|null}
     */
    var currentProfileName = null;

    /**
     * @type {string|null}
     */
    var currentMasterKey = null;

    /**
     * @type {string} - hash of local storage to be able to tell if there are any changes to persist
     */
    var localStorageHash = null;

    /**
     * @type {string} - hash of sync storage to be able to tell if there are any changes to persist
     */
    var syncStorageHash = null;

    /**
     * @type {number} - how often we will check for changes (ms) - do not overload sync storage (around 15min)
     */
    var storageChangeCheckInterval = 15 * 60 * 1000;

    /**
     * @type {null|int}
     */
    var storageChangeCheckTimeoutId = null;

    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {logger.log(msg, "CHROMESTORAGE", type);};

    /**
     * Read from local/sync storage
     * @param {string} location
     * @param {string} key
     * @returns {Promise}
     */
    var readFromStorage = function(location, key) {
        return new Promise(function (fulfill, reject) {
            if(_.indexOf(['local','sync'], location) == -1) {
                return reject(new Error("The specified location("+location+") does not exists in chrome.storage!"));
            }
            var chromeStorage = (location=="local" ? chrome.storage.local : chrome.storage.sync);
            chromeStorage.get(key, function(data) {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                fulfill(data);
            });
        });
    };

    /**
     * Writes out to chrome.storage.[location]
     * if location=="local" the data object is written out as it is
     * if location=="sync" the entire rawSyncStorageData is written out by
     *      re-encrypting the current profile data stored in config(sync section)
     * @param {string} location
     * @returns {Promise}
     */
    var writeToStorage = function(location) {
        return new Promise(function (fulfill, reject) {
            if (_.indexOf(['local', 'sync'], location) == -1) {
                return reject(new Error("The specified location(" + location + ") does not exists in chrome.storage!"));
            }
            var chromeStorage = (location=="local" ? chrome.storage.local : chrome.storage.sync);
            var data;
            if(location == "local") {
                data = cfg.get("local");
            } else if(location == "sync") {
                var CPDSTR = JSON.stringify(cfg.get("sync"));
                //log("CRYPTING CURRENT PROFILE("+currentProfileName+"):"+CPDSTR);
                rawSyncStorageData[currentProfileName] = cryptor.encryptAES(CPDSTR, currentMasterKey);
                data = rawSyncStorageData;
            }
            chromeStorage.set(data, function() {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                log("STORAGE("+location+") STORED.");
                calculateStorageHashes();
                fulfill();
            });
        });
    };

    /**
     * Called by initSyncStorage when there is no default profile
     * It creates and stores it by duplicating the "sync" section of the default configuration(config.js)
     * @returns {Promise}
     */
    var createAndStoreDefaultProfile = function() {
        return new Promise(function (fulfill, reject) {
            if(!hasProfile(defaultProfileName)) {
                //must be a first-runner - let's create default profile
                log("CREATING DEFAULT PROFILE("+defaultProfileName+")...", "info");
                currentProfileName = defaultProfileName;
                currentMasterKey = defaultMasterKey;
                writeToStorage("sync").then(function() {
                    currentProfileName = null;
                    currentMasterKey = null;
                    fulfill();
                }).error(function (e) {
                    return reject(e);
                }).catch(Error, function (e) {
                    return reject(e);
                });
            } else {
                fulfill();
            }
        });
    };


    /**
     * Returns array of available profiles
     * @returns {Array}
     */
    var getAvailableProfiles = function() {
        return(_.keys(rawSyncStorageData));
    };

    /**
     * Checks if profile exists
     * @param profile
     * @returns {boolean}
     */
    var hasProfile = function(profile) {
        return(_.indexOf(getAvailableProfiles(), profile) !== -1);
    };

    /**
     * Returns true if storage has been initialized (has decrypted data)
     * @returns {boolean}
     */
    var isInitialized = function() {
        return(!_.isNull(currentProfileName) && !_.isNull(currentMasterKey));
    };

    /**
     * Init local storage by merging local storage data to "local" section of configuration
     * @returns {Promise}
     */
    var initLocalStorage = function() {
        log("inizializing local storage...");
        return new Promise(function (fulfill, reject) {
            readFromStorage("local", null).then(function(data) {
                log("Loaded LocalStorageData:" + JSON.stringify(data));
                cfg.merge(data, "local");
                fulfill();
            }).error(function (e) {
                log("Rejected: " + e, "error");
                return reject(e);
            }).catch(Error, function (e) {
                log("Error: " + e, "error");
                return reject(e);
            });
        });
    };

    /**
     * Init sync storage -
     * @returns {Promise}
     */
    var initSyncStorage = function() {
        log("initializing sync storage...");
        return new Promise(function (fulfill, reject) {
            readFromStorage("sync", null).then(function (data) {
                rawSyncStorageData = data;
                if(_.isEmpty(getAvailableProfiles())) {
                    createAndStoreDefaultProfile().then(function() {
                        fulfill();
                    }).error(function (e) {
                        log("Rejected: " + e, "error");
                        return reject(e);
                    }).catch(Error, function (e) {
                        log("Error: " + e, "error");
                        return reject(e);
                    });
                } else {
                    fulfill();
                }
            }).error(function (e) {
                log("Rejected: " + e, "error");
                return reject(e);
            }).catch(Error, function (e) {
                log("Error: " + e, "error");
                return reject(e);
            });
        });
    };

    /**
     * Unlock sync storage by merging decrypted sync storage data to "sync" section of configuration
     * @param {string} profile
     * @param {string} masterKey
     * @returns {Promise}
     */
    var unlockSyncStorage = function(profile, masterKey) {
        profile = profile ? profile : defaultProfileName;
        log("unlocking sync storage profile...");
        return new Promise(function (fulfill, reject) {
            if(!hasProfile(profile)) {
                return reject(new Error("Inexistent profile("+profile+")! Available: " + JSON.stringify(getAvailableProfiles())));
            }
            if(!masterKey) {
                return reject(new Error("No MasterKey supplied to decrypt profile["+profile+"]!"));
            }
            log("Trying to decrypt data for profile["+profile+"]...");
            var CPDENC = rawSyncStorageData[profile];
            var profileDataObject = cryptor.decryptAES(CPDENC, masterKey, true);
            if(!profileDataObject) {
                return reject(new Error("This MasterKey does not open the door!", "info"));
            }
            log("PROFILE DATA DECRYPTED", "info");
            cfg.merge(profileDataObject, "sync");
            //
            currentProfileName = profile;
            currentMasterKey = masterKey;
            //
            calculateStorageHashes();
            //login successful - increasing login count
            set("sync.chromestorage.login_count", parseInt(get("sync.chromestorage.login_count")) + 1);
            fulfill();
        });
    };

    /**
     * Updated local/sync storage hashes so we can tell if there were changes
     */
    var calculateStorageHashes = function() {
        localStorageHash = cryptor.md5hash(JSON.stringify(cfg.get("local")));
        //log("Local storage hash: " + localStorageHash);
        syncStorageHash = cryptor.md5hash(JSON.stringify(cfg.get("sync")));
        //log("Sync storage hash: " + syncStorageHash);
    };

    /**
     * Checks if there are storage changes and triggers storage
     */
    var checkStorageChanges = function() {
        if (isInitialized()) {
            if (localStorageHash != cryptor.md5hash(JSON.stringify(cfg.get("local")))) {
                log("Local Storage changed - triggering storage...");
                writeToStorage("local").then(function () {
                    log("Local Storage changes persisted");
                }).error(function (e) {
                    log("Rejected: " + e, "error");
                }).catch(Error, function (e) {
                    log("Error: " + e, "error");
                });
            }
            if (syncStorageHash != cryptor.md5hash(JSON.stringify(cfg.get("sync")))) {
                log("Sync Storage changed - triggering storage...");
                writeToStorage("sync").then(function () {
                    log("Sync Storage changes persisted");
                }).error(function (e) {
                    log("Rejected: " + e, "error");
                }).catch(Error, function (e) {
                    log("Error: " + e, "error");
                });
            }
            storageChangeCheckTimeoutId = _.delay(checkStorageChanges, storageChangeCheckInterval);
        }
    };


    /**
     * Getter
     * @param key
     * @returns {*}
     */
    var get = function(key) {
        return(cfg.get(key));
    };

    /**
     * Setter
     * @param key
     * @param value
     * @returns {*} - old value
     */
    var set = function(key, value) {
        var oldVal = cfg.set(key, value);
        var location = _.first(key.split("."));
        return(oldVal);
    };


    return {
        /**
         * Init Local and Sync storages
         * @returns {Promise}
         */
        initialize: function() {
            return new Promise(function (fulfill, reject) {
                Promise.all([
                    initLocalStorage(),
                    initSyncStorage()
                ]).then(function() {
                    log("INITIALIZED", "info");
                    log("Available profiles: " + JSON.stringify(getAvailableProfiles()));
                    fulfill();
                }).error(function(e) {
                    log(e, "error");
                }).catch(function(e) {
                    log(e, "error");
                });
            });
        },

        /**
         * Shut down component -
         * @returns {Promise}
         * todo: FINISH ME!
         */
        shutdown: function() {
            return new Promise(function (fulfill, reject) {
                storageChangeCheckTimeoutId = null;
                Promise.all([
                    writeToStorage("local"),
                    writeToStorage("sync")
                ]).then(function() {
                    currentProfileName = null;
                    currentMasterKey = null;
                    cfg.resetToDefault();
                    log("SHUTDOWN COMPLETED", "info");
                    fulfill();
                }).error(function(e) {
                    log(e, "error");
                    return reject(e);
                }).catch(function(e) {
                    log(e, "error");
                    return reject(e);
                });
            });
        },

        /**
         * Main interface to unlock sync storage profile
         * @param {string} profile
         * @param {string} masterKey
         * @returns {Promise}
         */
        unlockSyncedStorage: function(profile, masterKey) {
            return new Promise(function (fulfill, reject) {
                unlockSyncStorage(profile, masterKey).then(function() {
                    log("Loaded configuration: " + JSON.stringify(cfg.getAll()));
                    checkStorageChanges();
                    fulfill();
                }).error(function(e) {
                    log(e, "error");
                    return reject(e);
                }).catch(function(e) {
                    log(e, "error");
                    return reject(e);
                });
            });
        },



        getAvailableProfiles: getAvailableProfiles,
        isInitialized: isInitialized,
        get:get,
        set: set
    };
});
