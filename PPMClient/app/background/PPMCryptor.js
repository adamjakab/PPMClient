/**
 * Crypt/Decrypt methods
 */
define([
    'config', 'PPMLogger', 'underscore', 'bluebird',
    'CryptoJs/md5', 'CryptoJs/hmac-md5',
    'CryptoJs/sha3',
    'CryptoJs/aes', 'CryptoJsComponents/mode-ctr'
], function (cfg, logger, _, Promise) {
    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {logger.log(msg, "CRYPTOR", type);};

    var AesMode = { mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.Pkcs7};

    AesMode.format = {
        /**
         * creates a string divided by ":" character with [cipherText]:[iv]:[salt]
         * @param cipherParams
         * @return {string}
         */
        stringify: function (cipherParams) {
            return (
                cipherParams.ciphertext.toString(CryptoJS.enc.Hex)
                + ":"
                + cipherParams.iv.toString()
                + ":"
                + cipherParams.salt.toString()
            );
        },
        /**
         * parse and extract the above stringified values to cipherParams
         * @param {string} parsable
         */
        parse: function (parsable) {
            var parsedArray = parsable.split(":");
            if(parsedArray.length === 3) {
                return CryptoJS.lib.CipherParams.create({
                    ciphertext: CryptoJS.enc.Hex.parse(parsedArray[0]),
                    iv: CryptoJS.enc.Hex.parse(parsedArray[1]),
                    salt: CryptoJS.enc.Hex.parse(parsedArray[2])
                });
            } else {
                return false;
            }
        }
    };



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
         * Returns Md5 hash - if key is supplied Hmac is used
         * @param {string} txt
         * @param {string} [key]
         * @returns {string}
         */
        md5hash: function(txt, key) {
            key = (_.isUndefined(key) ? null : key);
            var hash = (key===null ? CryptoJS.MD5(txt) : CryptoJS.HmacMD5(txt, key));
            return(hash.toString(CryptoJS.enc.Hex));
        },

        /**
         * Returns Sha3 hash (using by default 256 bit length)
         * @param {string} txt
         * @returns {string}
         */
        sha3Hash: function(txt) {
            return(CryptoJS.SHA3(txt, { outputLength: 256 }).toString(CryptoJS.enc.Hex));
        },

        /**
         *
         * @param {string} txt
         * @param {string} key
         * @returns {string}
         */
        encryptAES: function(txt, key) {
            var encrypted = CryptoJS.AES.encrypt(txt, key, AesMode);
            var ciphertext = encrypted.toString();
            return(ciphertext);
        },

        /**
         * @param {string} cipherText - text to decrypt
         * @param {string} key - key to decrypt with
         * @param {boolean} [parse] - return json parsed object
         * @return {string|object} answer
         */
        decryptAES: function(cipherText, key, parse) {
            var answer = CryptoJS.AES.decrypt(cipherText, key, AesMode);
            answer = answer.toString(CryptoJS.enc.Utf8);
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
