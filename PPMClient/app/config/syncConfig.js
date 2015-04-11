/**
 * PPM default configuration for Chrome sync storage
 */
define(['ConfigurationManager'],
    /**
     * @param ConfigurationManager
     * @return {ConfigurationManager}
     */
    function (ConfigurationManager) {
        return new ConfigurationManager(
            {
                logger: {
                    do_console_logging: true,
                    log_objects_to_keep: 250
                },
                utils: {
                },
                cryptor: {
                    aes: {
                        /* these are not yet implemented so changing the values below will not do anything */
                        /* hardcoded mode: CTR - hardcoded padding: Pkcs7 */
                        mode: "CTR", /* modes: CBC, CFB, CTR, OFB, ECB */
                        padding: "Pkcs7" /* paddings: Pkcs7, Iso97971, AnsiX923, Iso10126, ZeroPadding, NoPadding */
                    },
                    schemes: {
                        "OnePass": {
                            description: "Single pass variable key Aes encryption.",
                            encryptMethodBody: 'return CryptoModule.encryptAES(text, key+id);',
                            decryptMethodBody: 'return CryptoModule.decryptAES(text, key+id);'
                        },
                        "AesMd5": {
                            description: "Default double Aes encryption with key+id in first pass and with HmacMD5 of key in second.",
                            encryptMethodBody: 'return CryptoModule.encryptAES(CryptoModule.encryptAES(text, key+id), CryptoModule.md5Hash(key, id));',
                            decryptMethodBody: 'return CryptoModule.decryptAES(CryptoModule.decryptAES(text, CryptoModule.md5Hash(key, id)), key+id);'
                        }
                    }
                },
                chromestorage: {
                    login_count: 0,
                    login_date: "",
                    login_ip: ""
                },
                serverconcentrator: {
                    servers: {
                        server_0: {
                            name: "Paranoia Master Server",
                            type: "master",
                            url:  "http://localhost:8888",
                            username: "your-user-name",
                            password: "(:-very_secure_password-:)",
                            master_key: "Paranoia",
                            encryption_scheme: "OnePass",
                            ping_interval: 60
                        }
                    }
                },
                pwgen: {
                    length: 32,
                    options: {
                        "alphaUpper": true,
                        "alphaLower": true,
                        "numeric": true,
                        "special": true,
                        "extendedUpper": false,
                        "extendedLower": false,
                        "extra": false,
                        "extraChars": ""
                    }
                },
                passcard: {
                    default_username: "",
                    autofill_password: true
                }
            }
        );
    }
);