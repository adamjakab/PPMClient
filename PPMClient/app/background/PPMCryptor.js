/**
 * Crypt/Decrypt methods
 */
define([
    'config',
    'PPMLogger',
    'underscore',
    'bluebird'
], function (cfg, logger, _, Promise) {
    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {logger.log(msg, "CRYPTOR", type);};

    return {
        /**
         * Initialize component
         * @returns {Promise}
         */
        initialize: function() {
            return new Promise(function (fulfill, reject) {
                log("INITIALIZED", "info");
                fulfill();
            });
        },

        /**
         * Shut down component
         * @returns {Promise}
         */
        shutdown: function() {
            return new Promise(function (fulfill, reject) {
                log("SHUTDOWN COMPLETED", "info");
                fulfill();
            });
        },

        /**
         *
         * @param {string} txt
         * @returns {string}
         */
        md5hash: function(txt){
            return(Md5.hex_md5(txt));
        },

        /**
         *
         * @param {string} txt
         * @param {string} key
         * @returns {string}
         */
        encryptAES: function(txt, key) {
            return(Aes.Ctr.encrypt(txt, key, cfg.get("sync.cryptor.bits")));
        },

        /**
         * @param {string} cipherText - text to decrypt
         * @param {string} key - key to decrypt with
         * @param {boolean} [parse] - return json parsed object
         * @return {string|object} answer
         */
        decryptAES: function(cipherText, key, parse) {
            var answer = Aes.Ctr.decrypt(cipherText, key, cfg.get("sync.cryptor.bits"));
            if (parse === true) {
                try {
                    answer = JSON.parse(answer);
                    if (!_.isObject(answer)) {
                        answer = false;
                    }
                } catch (e) {
                    answer = false;
                }
            }
            return(answer);
        }
    };
});
