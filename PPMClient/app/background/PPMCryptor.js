/**
 * Crypt/Decrypt methods
 */
define([
    'PPMLogger',
    'PPMUtils',
    'ChromeStorage',
    'CryptoModule',
    'underscore',
    'bluebird'
], function (PPMLogger, PPMUtils, ChromeStorage, CryptoModule, _, Promise) {
    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {PPMLogger.log(msg, "CRYPTOR", type);};

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
     *
     */
    var registerEncryptionSchemes = function() {
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
        }
    };
});
