//PPM default configurations
/**
 * @type {ConfigOptions} ConfigOptions
 */
define(['utils/ConfigOptions'], function (ConfigOptions) {
    var configOptions = new ConfigOptions({
        local: {
            test: 123
        },
        sync: {
            logger: {
                do_console_logging: true,
                log_objects_to_keep: 250
            },
            utils: {

            },
            cryptor: {
                bits: 256
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
    });

    return(configOptions);
});