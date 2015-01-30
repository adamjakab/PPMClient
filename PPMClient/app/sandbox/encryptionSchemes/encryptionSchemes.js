/**
 * Loaded with requirejs
 */
requirejs.config({
    baseUrl: '',
    paths: {
        /* PATHS */
        CryptoJs: '../../../vendor/crypto-js-evanvosberg/build/rollups',
        CryptoJsComponents: '../../../vendor/crypto-js-evanvosberg/build/components',
        /* MODULES */
        underscore: '../../../vendor/underscore/underscore',
        CryptoModule: '../../lib/CryptoModule'
    },
    shim: {},
    deps: []
});

require([
        'underscore',
        'CryptoModule'
], function(_, CryptoModule) {
        console.log("SANDBOX READY!");

        /**
         * @type {{}}
         */
        var encryptionSchemes = {};

        /**
         *
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
                randomstring += chars.substring(rnum,rnum+1);
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
                    case 'registerScheme':
                        response["response"] = registerEncryptionScheme(event.data);
                        break;
                    default:
                        response["message"] = "Unknown command: " + event.data.command;
                }
                event.source.postMessage(response, event.origin);
            }
        });
    }
);
