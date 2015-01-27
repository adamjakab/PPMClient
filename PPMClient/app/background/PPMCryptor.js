/**
 * Crypt/Decrypt methods
 */
define([
    'PPMLogger', 'PPMUtils', 'CryptoModule', 'underscore', 'bluebird'
], function (logger, PPMUtils, CryptoModule, _, Promise) {
    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {logger.log(msg, "CRYPTOR", type);};

    /**
     * The Iframe where the encryption schemes are registered in the background page
     */
    var encryptionSchemesSandbox = document.getElementById('encryptionSchemesSandbox');

    /**
     * PPM CustomEvent Listener - main event listener
     * DISPATCH CUSTOM EVENT LIKE THIS: UTILS.dispatchCustomEvent({type:"logged_in", ...});
     */
    var customEventListener = function(e) {
        if(e && _.isObject(e.detail)) {
            var eventData = e.detail;
            switch (eventData.type) {
                case "logged_in":
                    //log("Caught CustomEvent["+eventData.type+"]");
                    registerEncryptionSchemes();
                    break;
                case "logged_out":
                    //log("Caught CustomEvent["+eventData.type+"]");
                    //registerEncryptionSchemes();
                    break;
            }
        }
    };


    var listenToSandboxEvents = function(event) {
        if(!_.isUndefined(event.data)) {
            log("SBResponse: " + JSON.stringify(event.data), "warning");
        }
    };

    /**
     * @todo: problem we cannot require ChromeStorage because ChromeStorage requires PPMCryptor so we'd have circular reqs
     * @todo: check if ChromeStorage can use the new CryptoModule without requiring this PPMCryptor module!
     * @todo: YES, I checked! It could!
     */
    var registerEncryptionSchemes = function() {
        var ChromeStorage = require("ChromeStorage");
        var syncConfig = ChromeStorage.getConfigByLocation("sync");
        var schemes = syncConfig.get("cryptor.schemes");
        log("SCHEMES: " + JSON.stringify(schemes));
        return;
        var messageId = PPMUtils.get_uuid_v4();
        var data = {
            domain: 'encryptionSchemes',
            messageId: messageId,
            command: 'registerScheme',
            schemeName: 'testScheme',
            /* args: ["text", "key", "id", "CryptoModule"]*/
            //encryptMethodBody: 'return CryptoModule.encryptAES(text, key+id);',
            //decryptMethodBody: 'return CryptoModule.decryptAES(text, key+id);'
            encryptMethodBody: 'return CryptoModule.encryptAES(CryptoModule.encryptAES(text, key+id), CryptoModule.md5Hash(key, id));',
            decryptMethodBody: 'return CryptoModule.decryptAES(CryptoModule.decryptAES(text, CryptoModule.md5Hash(key, id)), key+id);'
        };
        encryptionSchemesSandbox.contentWindow.postMessage(data, "*");
    };



    return {
        /**
         * Initialize component
         * @returns {Promise}
         */
        initialize: function() {
            return new Promise(function (fulfill, reject) {
                window.addEventListener('message', listenToSandboxEvents);
                document.addEventListener("PPM", customEventListener, false);
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
                document.removeEventListener("PPM", customEventListener, false);
                window.removeEventListener('message', listenToSandboxEvents);
                log("SHUTDOWN COMPLETED", "info");
                fulfill();
            });
        },

        /**
         * Returns Md5 hash - if key is supplied HmacMD5 is used
         * @param {string} txt
         * @param {string} [key]
         * @returns {string}
         */
        md5Hash: CryptoModule.md5Hash,

        /**
         * Returns Sha3 hash (using by default 256 bit length)
         * @param {string} txt
         * @returns {string}
         */
        sha3Hash: CryptoModule.sha3Hash,

        /**
         *
         * @param {string} txt
         * @param {string} key
         * @returns {string}
         */
        encryptAES: CryptoModule.encryptAES,

        /**
         * @param {string} cipherText - text to decrypt
         * @param {string} key - key to decrypt with
         * @param {boolean} [parse] - return json parsed object
         * @return {string|object|boolean} answer - the decrypted string or parsed object or false
         */
        decryptAES: function(cipherText, key, parse) {
            try {
                var answer = CryptoModule.decryptAES(cipherText, key);
                if (answer !== false && parse === true) {
                    answer = JSON.parse(answer);
                    if (!_.isObject(answer)) {
                        answer = false;
                    }
                }
            } catch (e) {
                answer = false;
            }
            return(answer);
        }
    };
});
