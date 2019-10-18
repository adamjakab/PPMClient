/**
 * CryptoModule - Encryption and utility methods for encryption schemes
 * Aes Encrypt/Decrypt and Hashing methods
 */
define([
        'underscore',
        'CryptoJs/crypto-js',
        'CryptoJs/md5', 'CryptoJs/hmac-md5',
        'CryptoJs/sha3',
        'CryptoJs/aes', 'CryptoJs/mode-ctr'
    ],
    function (_, CryptoJS) {
        /**
         * Mode, padding and formatting methods for Aes encryption
         * @type {{mode: (CryptoJS.mode.CTR|*), padding: (CryptoJS.pad.Pkcs7|*), format: {stringify: Function, parse: Function}}}
         */
        let AesMode = {
            mode: CryptoJS.mode.CTR,
            padding: CryptoJS.pad.Pkcs7,
            format: {
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
                    if (parsedArray.length === 3) {
                        return CryptoJS.lib.CipherParams.create({
                            ciphertext: CryptoJS.enc.Hex.parse(parsedArray[0]),
                            iv: CryptoJS.enc.Hex.parse(parsedArray[1]),
                            salt: CryptoJS.enc.Hex.parse(parsedArray[2])
                        });
                    } else {
                        return false;
                    }
                }
            }
        };


        return {
            /**
             * Returns Md5 hash - if key is supplied HmacMD5 is used
             * @param {string} txt
             * @param {string} [key]
             * @returns {string}
             */
            md5Hash: function (txt, key) {
                key = (_.isUndefined(key) ? null : key);
                var hash = (key === null ? CryptoJS.MD5(txt) : CryptoJS.HmacMD5(txt, key));
                return (hash.toString(CryptoJS.enc.Hex));
            },

            /**
             * Returns Sha3 hash (using by default 256 bit length)
             * @param {string} txt
             * @returns {string}
             */
            sha3Hash: function (txt) {
                return (CryptoJS.SHA3(txt, {outputLength: 256}).toString(CryptoJS.enc.Hex));
            },

            /**
             * Returns Aes encrypted cipherText using the predefined AesMode
             * @param {string} txt
             * @param {string} key
             * @returns {string}
             */
            encryptAES: function (txt, key) {
                var encrypted = CryptoJS.AES.encrypt(txt, key, AesMode);
                var ciphertext = encrypted.toString();
                return (ciphertext);
            },

            /**
             * Returns the string decrypted from cipherText
             * @param {string} cipherText - text to decrypt
             * @param {string} key - key to decrypt with
             * @return {string|boolean} answer - the decrypted string or false
             */
            decryptAES: function (cipherText, key) {
                try {
                    var answer = CryptoJS.AES.decrypt(cipherText, key, AesMode);
                    answer = answer.toString(CryptoJS.enc.Utf8);
                } catch (e) {
                    answer = false;
                }
                return (answer);
            }
        };
    }
);