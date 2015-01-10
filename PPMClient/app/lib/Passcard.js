/**
 * Passcard
 */
define([
        'PPMLogger',
        'PPMUtils',
        'PPMCryptor',
        'bluebird',
        'underscore'
    ],
    function (logger, utils, cryptor, Promise, _) {
        /**
         * Log facility
         * @param {String} msg
         * @param {String} [type]
         */
        var log = function(msg, type) {logger.log(msg, "PASSCARD", type);};

        /**
         *
         * @param {ConfigurationManager} pcData
         * @constructor
         */
        function Passcard(pcData) {
            /**
             * @type {ConfigurationManager}
             */
            var config;

            //do some checks
            if (_.isUndefined(pcData)) {
                throw "Missing configuration!";
            }
            if (!pcData.get("_id", false)) {
                throw "Missing Id!";
            }
            if (pcData.get("collection") != "passcard") {
                throw "Not a passcard!";
            }
            if (!pcData.get("name", false)) {
                throw "Passcard must have a name!";
            }

            //create config
            config = new ConfigurationManager({
                data: {
                    _id: null,
                    name: null,
                    identifier: null,
                    collection: "passcard",
                    payload: null,
                    username: null,
                    password: null,
                    creation_ts: utils.getTimestamp(),
                    modification_ts: null,
                    pw_change_ts: null
                },
                sync_state: 0, // 0=OK(in sync), 1=MODIFIED(out of sync), 2=DELETED(out of sync)
                has_secret: false //payload not yet loaded
            });
            config.merge(pcData.getAll(), "data");
            log("Initialized with: " + JSON.stringify(config.getAll()));


            /**
             * @param {string} prop
             * @param {*} [defaultValue]
             * @return {*}
             */
            var get = function(prop, defaultValue) {
                var answer;
                if (prop == "all") {
                    answer = config.getAll();
                } else if (prop == "save_data") {
                    answer = getSaveData();
                } else {
                    answer = config.get(prop, defaultValue);
                }
                return(answer);
            };

            /**
             * Sets passcard data
             * @param {string} prop
             * @param {*} value
             * @param {Boolean} [noSyncCheck] - Force not to set sync-sate (usually when loading and setting username/pwd from payload)
             */
            var set = function(prop, value, noSyncCheck) {
                noSyncCheck = (noSyncCheck === true);
                //log("SETTING("+prop+"): " + JSON.stringify(value));
                var before = _.clone(getSaveData());
                if(prop == "data" && _.isObject(value)) {
                    config.merge(value, "data");
                } else if(_.contains(["name", "identifier", "username", "password"], prop)) {
                    config.set(["data", prop], value);
                } else if (prop == "sync_state" && _.isNumber(value) && _.contains([0,1,2], value)) {
                    config.set(prop, value);
                } else if (prop == "has_secret" && _.isBoolean(value)) {
                    config.set(prop, value);
                }
                var after = getSaveData();
                if(!noSyncCheck && !_.isEqual(before, after)) {
                    config.set("sync_state", 1);
                    config.set("data.modification_ts", utils.getTimestamp());
                    if(before["payload"]["password"] != after["payload"]["password"]) {
                        config.set("data.pw_change_ts", utils.getTimestamp());
                    }
                }
                //dispatch "passcard_change" event in any case (maybe only sync_state was set back to 0)
                utils.dispatchCustomEvent({type:"passcard_change"});
            };

            /**
             * @return {Boolean}
             */
            var hasSecret = function() {
                return config.get("has_secret", false);
            };

            /**
             * Requests,loads, sets and returns secret data
             * @return {Promise}
             */
            var getSecret = function() {
                return new Promise(function (fulfill, reject) {
                    if(hasSecret()) {
                        return fulfill({username: config.get("data.username"), password: config.get("data.password")});
                    }
                    utils.dispatchCustomEvent({type:"passcard_secret_request", id: config.get("data._id")});
                    var secretWaitInterval = setInterval(function() {
                        if(hasSecret()) {
                            clearInterval(secretWaitInterval);
                            secretWaitInterval = null;
                            fulfill({username: config.get("data.username"), password: config.get("data.password")});
                        }
                    }, 250);
                    setTimeout(function() {
                        clearInterval(secretWaitInterval);
                        secretWaitInterval = null;
                        return reject(new Error("Getting secret payload has timed out!"));
                    }, 30 * 1000);
                });
            };



            /**
             * Returns data object to be saved into Storage on server, will:
             *  1) put into payload object all fields(username, password) which will be encrypted by server specific configuration
             *  2) remove the fields used in payload(username, password) from object
             *  @todo: need to find a way to exclude payload if there were no changes in username/password
             * @return {Object}
             */
            var getSaveData =function() {
                var saveData = _.clone(config.get("data"));
                saveData.payload = {
                    username: saveData["username"],
                    password: saveData["password"]
                };
                delete saveData["username"];
                delete saveData["password"];
                return saveData;
            };

            //public
            this.get = get;
            this.set = set;
            this.hasSecret = hasSecret;
            this.getSecret = getSecret;
        }

        return Passcard;
    }
);