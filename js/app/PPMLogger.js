//Logger
define(['utils/ConfigOptions'], function (ConfigOptions) {

    /**
     * @type {ConfigOptions}
     */
    var cfg = new ConfigOptions({
        do_console_logging: true,
        log_objects_to_keep: 250,
        log_index: 0
    });

    /**
     * @type {Array}
     */
    this.logs = [];



    return {
        log : function() {

        }



    };
});