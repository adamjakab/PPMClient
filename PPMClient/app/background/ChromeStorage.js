/**
 * Chrome Storage (local + sync)
 */
define([
    'localConfig',
    'syncConfig',
    'PPMLogger',
    'PPMUtils',
    'PPMCryptor',
    'CryptoModule',
    'bluebird',
    'underscore'
], function (localConfig, syncConfig, PPMLogger, PPMUtils, PPMCryptor, CryptoModule, Promise, _) {
    /**
     * @type {object} rawSyncStorageData
     */
    var rawSyncStorageData;

    /** @type {string} */
    var defaultProfileName = "DEFAULT";
    /** @type {string} */
    var defaultEncryptionScheme = "AesMd5";
    /** @type {string} */
    var defaultEncryptionKey = "Paranoia";

    /** @type {string|null} */
    var currentProfileName = null;
    /** @type {string|null} */
    var currentEncryptionScheme = null;
    /** @type {string|null} */
    var currentEncryptionKey = null;

    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {PPMLogger.log(msg, "CHROMESTORAGE", type);};

    /**
     * Read from local/sync storage
     * @param {string} location
     * @param {string} key
     * @returns {Promise}
     */
    var readFromStorage = function(location, key) {
        return new Promise(function (fulfill, reject) {
            var chromeStorage = getStorageByLocation(location);
            if(_.isNull(chromeStorage)) {
                return reject(new Error("The specified location("+location+") does not exists in chrome.storage!"));
            }
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
            var data;
            var _doWrite = function() {
                chromeStorage.set(data, function() {
                    if (chrome.runtime.lastError) {
                        return reject(chrome.runtime.lastError);
                    }
                    log("STORAGE("+location+") STORED.");
                    fulfill();
                });
            };

            var chromeStorage = getStorageByLocation(location);
            if(_.isNull(chromeStorage)) {
                return reject(new Error("The specified location("+location+") does not exists in chrome.storage!"));
            }

            if(location == "local") {
                data = localConfig.getAll();
                _doWrite();
            } else if(location == "sync") {
                PPMCryptor.encryptPayload(
                    JSON.stringify(syncConfig.getAll()),
                    currentProfileName,
                    currentEncryptionScheme,
                    currentEncryptionKey
                ).then(function(encryptedData) {
                        rawSyncStorageData[currentProfileName] = encryptedData;
                        data = rawSyncStorageData;
                        _doWrite();
                    }
                ).catch(function (e) {
                        return reject(e);
                    }
                );
            }
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
                currentEncryptionScheme = defaultEncryptionScheme;
                currentEncryptionKey = defaultEncryptionKey;
                writeToStorage("sync").then(function() {
                    currentProfileName = null;
                    currentEncryptionScheme = null;
                    currentEncryptionKey = null;
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

    var getCurrentProfile = function() {
        return currentProfileName;
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
    var hasDecryptedSyncData = function() {
        return(!_.isNull(currentProfileName) && !_.isNull(currentEncryptionKey));
    };

    /**
     * Init local storage by merging local storage data to "local" section of configuration
     * @returns {Promise}
     */
    var initLocalStorage = function() {
        log("inizializing local storage...");
        return new Promise(function (fulfill, reject) {
            readFromStorage("local", null).then(function(data) {
                localConfig.merge(data);
                localConfig.addChangeListener(localStorageChangeListener);
                log("Merged LocalStorage Data:" + JSON.stringify(localConfig.getAll()));
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
     * @param {string} profileName
     * @param {string} encryptionScheme
     * @param {string} encryptionKey
     * @returns {Promise}
     */
    var unlockSyncStorage = function(profileName, encryptionScheme, encryptionKey) {
        profileName = profileName ? profileName : defaultProfileName;
        log("unlocking sync storage profile...");
        return new Promise(function (fulfill, reject) {
            if(!hasProfile(profileName)) {
                return reject(new Error("Inexistent profile("+profileName+")! Available: " + JSON.stringify(getAvailableProfiles())));
            }
            if(!encryptionScheme) {
                return reject(new Error("No encryptionScheme supplied to decrypt profile["+profileName+"]!"));
            }
            if(!encryptionKey) {
                return reject(new Error("No encryptionKey supplied to decrypt profile["+profileName+"]!"));
            }
            log("Trying to decrypt data for profile["+profileName+"] with encryption scheme["+encryptionScheme+"]...");
            PPMCryptor.decryptPayload(
                rawSyncStorageData[profileName],
                profileName,
                encryptionScheme,
                encryptionKey
            ).then(function(decryptedData) {
                    var profileDataObject = PPMUtils.objectizeJsonString(decryptedData);
                    if(!profileDataObject) {
                        return reject(new Error("This key does not open the door!", "info"));
                    }
                    log("PROFILE DATA DECRYPTED", "info");
                    //calling merge on syncConfig with "deep" option true so we deep-merge the objects
                    syncConfig.merge(profileDataObject, false, true);
                    //
                    currentProfileName = profileName;
                    currentEncryptionScheme = encryptionScheme;
                    currentEncryptionKey = encryptionKey;
                    //login successful - increasing login count
                    syncConfig.set("chromestorage.login_count", syncConfig.get("chromestorage.login_count") + 1);
                    fulfill();
                }
            ).catch(function (e) {
                    log("Sync Storage Unlock Error: " + e, "error");
                    return reject(e);
                }
            );
        });
    };

    /**
     * Called by ConfigurationManager when data changes
     */
    var syncStorageChangeListener = function() {
        log("Sync Storage changed - triggering storage...");
        writeToStorage("sync").then(function () {
            log("Sync Storage changes persisted");
        }).error(function (e) {
            log("Rejected: " + e, "error");
        }).catch(Error, function (e) {
            log("Error: " + e, "error");
        });
    };

    /**
     * Called by ConfigurationManager when data changes
     */
    var localStorageChangeListener = function() {
        log("Local Storage changed - triggering storage...");
        writeToStorage("local").then(function () {
            log("Local Storage changes persisted");
        }).error(function (e) {
            log("Rejected: " + e, "error");
        }).catch(Error, function (e) {
            log("Error: " + e, "error");
        });
    };

    /**
     * @param {string} location
     * @return {*}
     */
    var getStorageByLocation = function(location) {
        var answer = null;
        if(location == "local") {
            answer = chrome.storage.local;
        } else if(location == "sync") {
            answer = chrome.storage.sync;
        }
        return answer;
    };

    /**
     * @param {string} location
     * @return {ConfigurationManager}
     */
    var getConfigByLocation = function(location) {
        var answer = null;
        if(location == "local") {
            answer = localConfig;
        } else if(location == "sync") {
            answer = syncConfig;
        }
        return answer;
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
                    log("Available profiles: " + JSON.stringify(getAvailableProfiles()));
                    log("INITIALIZED", "info");
                    fulfill();
                }).error(function(e) {
                    log(e, "error");
                }).catch(function(e) {
                    log(e, "error");
                });
            });
        },

        /**
         * Shut down component
         * @returns {Promise}
         */
        shutdown: function() {
            return new Promise(function (fulfill, reject) {
                Promise.all([
                    writeToStorage("local"),
                    writeToStorage("sync")
                ]).then(function() {
                    currentProfileName = null;
                    currentEncryptionScheme = null;
                    currentEncryptionKey = null;
                    rawSyncStorageData = null;
                    localConfig.removeAllChangeListeners();
                    localConfig.restoreDefaults();
                    syncConfig.removeAllChangeListeners();
                    syncConfig.restoreDefaults();
                    log("SHUTDOWN COMPLETED", "info");
                    PPMUtils.dispatchCustomEvent({type:"logged_out"});
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
         * @param {string} profileName
         * @param {string} encryptionScheme
         * @param {string} encryptionKey
         * @returns {Promise}
         */
        unlockSyncStorage: function(profileName, encryptionScheme, encryptionKey) {
            return new Promise(function (fulfill, reject) {
                unlockSyncStorage(profileName, encryptionScheme, encryptionKey).then(function() {
                    log("Loaded configuration: " + JSON.stringify(syncConfig.getAll()));
                    syncConfig.addChangeListener(syncStorageChangeListener);
                    PPMUtils.dispatchCustomEvent({type:"logged_in"});
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
        getCurrentProfile: getCurrentProfile,
        hasDecryptedSyncData: hasDecryptedSyncData,
        getConfigByLocation: getConfigByLocation
    };
});
