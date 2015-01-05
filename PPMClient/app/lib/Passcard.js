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
                sync_state: 0 // 0=OK(in sync), 1=MODIFIED(out of sync), 2=DELETED(out of sync)
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
             * @param {string} prop
             * @param {*} value
             */
            var set = function(prop, value) {
                //log("SETTING("+prop+"): " + JSON.stringify(value));
                var before = _.clone(getSaveData());
                if(prop == "data" && _.isObject(value)) {
                    config.merge(value, "data");
                } else if(_.contains(["name", "identifier", "username", "password"], prop)) {
                    config.set(["data", prop], value);
                } else if (prop == "sync_state" && _.isNumber(value) && _.contains([0,1,2], value)) {
                    config.set(prop, value);
                }
                var after = getSaveData();
                if(!_.isEqual(before, after)) {
                    config.set("sync_state", 1);
                    config.set("data.modification_ts", utils.getTimestamp());
                    if(before["password"] != after["password"]) {
                        config.set("data.pw_change_ts", utils.getTimestamp());
                    }
                }
                //dispatch "passcard_change" event in any case (maybe only sync_state was set back to 0)
                utils.dispatchCustomEvent({type:"passcard_change"});
            };

            /**
             * Returns data object to be saved into Storage on server, will:
             *  1) encrypt username and password and put it into payload
             *  2) remove username and password from object
             * @return {Object}
             */
            var getSaveData =function() {
                var saveData = config.get("data");

                return saveData;
            };

            //public
            this.get = get;
            this.set = set;
        }

        return Passcard;
    }
);