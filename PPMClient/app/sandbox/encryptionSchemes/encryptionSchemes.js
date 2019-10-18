/**
 * EncryptionSchemes Sandbox Script
 * ---------------------------------
 *
 * This module is responsible for registering encryption schemes and providing
 * a way to use encrypt/decrypt methods of ESs.
 */
requirejs.config({
    baseUrl: '',
    paths: {
        /* PATHS */
        CryptoJs: '../../../vendor/js/crypto-js',
        /* MODULES */
        underscore: '../../../vendor/js/underscore',
        CryptoModule: '../../lib/CryptoModule'
    },
    shim: {},
    deps: []
});

require([
        'underscore',
        'CryptoModule'
], function(_, CryptoModule) {
        /**
         * @type {{}}
         */
        var encryptionSchemes = {};

        /**
         * @param {object} data
         * @return {{}}
         */
        var registerEncryptionScheme = function(data) {
            var answer = {
                error: true,
                message: 'Unknown error!'
            };

            try {
                var scheme = {};

                //
                /**
                 * The arguments for both functions are the same:
                 *  - text:         {String} the text to encrypt/decrypt
                 *  - key:          {String} the key to use for encryption/decryption
                 *  - id:           {String} the id of the passcard which can be used for salting key
                 *  - CryptoModule: {CryptoModule} the module containing the hashing and Aes encryption/decryption methods
                 * @type {string[]}
                 */
                var args = ["text", "key", "id", "CryptoModule"];

                //The Encryption function
                scheme.encrypt = new Function(args, data.encryptMethodBody);

                //The Decryption function
                scheme.decrypt = new Function(args, data.decryptMethodBody);

                //test methods
                var testString = getRandomString(256);
                var testKey = getRandomString(64);
                var testId = getRandomString(32);
                var encString = scheme.encrypt(testString, testKey, testId, CryptoModule);
                var decString = scheme.decrypt(encString, testKey, testId, CryptoModule);

                if(_.isEqual(testString, decString)) {
                    encryptionSchemes[data.schemeName] = scheme;
                    answer["error"] = false;
                    answer["message"] = "Encryption Scheme("+data.schemeName+") registered.";
                } else {
                    answer["message"] = "Encryption Scheme("+data.schemeName+") registration error: "
                        + "String after encryption and decryption is not equal to original string!";
                }
            } catch(e) {
                answer["message"] = "Encryption Scheme("+data.schemeName+") registration error: " + e;
            }
            return answer;
        };

        /**
         * @return {{error: boolean, message: string}}
         */
        var unregisterAllEncryptionSchemes = function() {
            encryptionSchemes = {};
            return {
                error: false,
                message: "All encryption schemes have been unregistered."
            };
        };

        /**
         * @return {{error: boolean, message: *}}
         */
        var getRegisteredSchemeNames = function() {
            return {
                error: false,
                message: _.keys(encryptionSchemes)
            };
        };

        /**
         * Encrypts text with specified ES
         *
         * @param {{
                passcardPayloadText: passcardPayloadText,
                encryptionKey: encryptionKey,
                passcardId: passcardId,
                encryptionScheme: encryptionScheme
            }} data
         * @return {{}}
         */
        var encryptPayload = function(data) {
            var answer = {
                error: true,
                message: 'Unknown error!'
            };
            try {
                if(_.contains(_.keys(encryptionSchemes), data.encryptionScheme)) {
                    var scheme = encryptionSchemes[data.encryptionScheme];
                    answer["message"] = scheme.encrypt(data.passcardPayloadText, data.encryptionKey, data.passcardId, CryptoModule);
                    answer["error"] = false;
                } else {
                    answer["message"] = "Encryption Scheme("+data.encryptionScheme+") is not registered";
                }
            } catch(e) {
                answer["message"] = "Encryption("+data.encryptionScheme+") error: " + e;
            }
            return answer;
        };

        /**
         * Decrypts text with specified ES
         *
         * @param {{
                passcardPayloadText: passcardPayloadText,
                encryptionKey: encryptionKey,
                passcardId: passcardId,
                encryptionScheme: encryptionScheme
            }} data
         * @return {{}}
         */
        var decryptPayload = function(data) {
            var answer = {
                error: true,
                message: 'Unknown error!'
            };
            try {
                if(_.contains(_.keys(encryptionSchemes), data.encryptionScheme)) {
                    var scheme = encryptionSchemes[data.encryptionScheme];
                    answer["message"] = scheme.decrypt(data.passcardPayloadText, data.encryptionKey, data.passcardId, CryptoModule);
                    answer["error"] = false;
                } else {
                    answer["message"] = "Decryption Scheme("+data.encryptionScheme+") is not registered";
                }
            } catch(e) {
                answer["message"] = "Decryption("+data.encryptionScheme+") error: " + e;
            }
            return answer;
        };

        /**
         * Returns random string
         * @param {Number} length
         * @return {string}
         */
        var getRandomString = function(length) {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                + "abcdefghijklmnopqrstuvwxyz"
                + "0123456789"
                + "#@?!|&%^*+-=.:,;/([{<>}])"
                + "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß"
                + "àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ";
            var randomstring = '';
            for (var i=0; i<length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum, rnum+1);
            }
            return randomstring;
        };

        window.addEventListener('message', function(event) {
            if(event.data.domain == "encryptionSchemes") {
                var response = {
                    domain: event.data.domain,
                    command: event.data.command,
                    messageId: event.data.messageId
                };
                switch (event.data.command) {
                    case 'registerEncryptionScheme':
                        response["response"] = registerEncryptionScheme(event.data);
                        break;
                    case 'unregisterAllEncryptionSchemes':
                        response["response"] = unregisterAllEncryptionSchemes();
                        break;
                    case 'getRegisteredSchemeNames':
                        response["response"] = getRegisteredSchemeNames();
                        break;
                    case 'encryptPayload':
                        response["response"] = encryptPayload(event.data);
                        break;
                    case 'decryptPayload':
                        response["response"] = decryptPayload(event.data);
                        break;
                    default:
                        response["response"] = {
                            error: true,
                            message: "Unknown command: " + event.data.command
                        };
                }
                event.source.postMessage(response, event.origin);
            }
        });
    }
);
