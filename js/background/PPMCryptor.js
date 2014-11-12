/**
 * The main Encryption/Decryption interface
 * @param {ParanoiaPasswordManager} PPM
 * @param {object} [options]
 */
function PPMCryptor(PPM, options) {
    var cfg = new ConfigOptions({
        enc_dec_bits: 256
    });
    cfg.merge(options);

    var log = function(msg, type) {PPM.getComponent("LOGGER").log(msg, "PPMCryptor", type);};

    this.init = function() {
        log("INITIALIZED: " + JSON.stringify(cfg.getRecursiveOptions()), "info");
    };

    var _encryptAES = function(txt,key) {
        return(Aes.Ctr.encrypt(txt, key, cfg.get("enc_dec_bits")));
    };

    var _decryptAES = function(txt,key) {
        return(Aes.Ctr.decrypt(txt, key, cfg.get("enc_dec_bits")));
    };

    var _md5hash = function(txt){
        return(Md5.hex_md5(txt));
    };


    /**
     * @param {string} txt
     * @returns {string}
     */
    this.md5Hash = function(txt) {
        return(_md5hash(txt));
    };

    /**
     * @param {string} cipherText - text to decrypt
     * @param {string} key - key to decrypt with
     * @param {boolean} [parse] - return json parsed object
     * @return {string|object} answer
     */
    this.decrypt = function(cipherText, key, parse) {
        var answer = _decryptAES(cipherText, key);
        if (parse === true) {
            try {
                answer = JSON.parse(answer);
                if (!PPM.getComponent("UTILS").isObject(answer)) {
                    answer = false;
                }
            } catch (e) {
                answer = false;
            }
        }
        return(answer);
    };

    /**
     * @param {string} clearText
     * @param {string} key
     */
    this.encrypt = function(clearText, key) {
        return(_encryptAES(clearText, key));
    };
}


