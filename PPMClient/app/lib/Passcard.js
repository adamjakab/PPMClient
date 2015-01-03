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
         * @param {ConfigurationManager} pcCfg
         * @constructor
         */
        function Passcard(pcCfg) {
            /**
             * @type {ConfigurationManager}
             */
            var config;

            if (_.isUndefined(pcCfg) || _.isUndefined(pcCfg.get("collection")) || pcCfg.get("collection") != "passcard") {
                throw "Missing configuration or not a passcard!";
            }
            if (_.isUndefined(pcCfg.get("name")) || _.isEmpty(pcCfg.get("name"))) {
                throw "Passcard must have a name!";
            }
            //
            config = pcCfg;
            config.merge({
                payload: null, //initially we will not have payload
                sync_state: 0 // 0=OK(in sync), 1=MODDED(out of sync)
            });
            log("Initialized with: " + JSON.stringify(config.getAll()));


            /**
             * @param {string} prop
             * @return {*}
             */
            this.get = function(prop) {
                var answer;
                if (prop == "all") {
                    answer = config.getAll();
                } else {
                    answer = config.get(prop);
                }
                return(answer);
            };

            /**
             *
             * @param {string} prop
             * @param {*} value
             */
            this.set = function(prop, value) {
                if(prop == "all") {
                    config.merge(value);
                } else if(_.contains(["name"], prop)) {
                    config.set(prop, value);
                }
            }



        }

        return Passcard;
    }
);