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
                    /* these are not yet implemented so changing the values below will not do anything*/
                    aes: {
                        mode: "CTR", /* modes: CBC, CFB, CTR, OFB, ECB */
                        padding: "Pkcs7" /* paddings: Pkcs7, Iso97971, AnsiX923, Iso10126, ZeroPadding, NoPadding*/
                    }
                },
                gat: {
                    enabled: false
                },
                chromestorage: {
                    login_count: 0,
                    login_date: "",
                    login_ip: ""
                },
                serverconcentrator: {
                    server: {
                        0: {
                            name: "Paranoia Master Server",
                            type: "master",
                            url:  "http://localhost:8888",
                            username: "your-user-name",
                            password: "(:-very_secure_password-:)",
                            master_key: "Paranoia",
                            ping_interval: 60
                        }
                    }
                },
                pwgen: {
                    length: 32,
                    specialchars: '+-_|!$%&([{}])?^*@#.,:;~',
                    use_alpha_lower: true,
                    use_alpha_upper: true,
                    use_numeric: true,
                    use_special: true
                },
                passcard: {
                    default_username: "",
                    autofill_password: true
                }
            }
        );
    }
);