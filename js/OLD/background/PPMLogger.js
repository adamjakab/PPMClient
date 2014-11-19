/**
 * The main logging interface
 * @param {ParanoiaPasswordManager} [PPM]
 * @param {object} [options]
 * @constructor
 */
function PPMLogger(PPM, options) {
    var cfg = new ConfigOptions({
        do_console_logging: true,
        log_objects_to_keep: 250,
        log_index: 0
    });
    cfg.merge(options);

    this.logs = [];

    this.init = function() {
        this.log("INITIALIZED: " + JSON.stringify(cfg.getRecursiveOptions()), "PPMLogger", "info");
    };

    /**
     * @param {string} msg
     * @param {string} [zone]
     * @param {string} [type]
     */
    this.log = function(msg, zone, type) {
        var LO = this.getLogObject(msg, zone, type);
        this.memorizeLogObject(LO);
        if (cfg.get("do_console_logging")) {
            var logString = this.stringifyLogObject(LO);
            logString = "[#"+LO.index+"]" + logString;
            if(LO.type == "error") {
                console.error(logString);
            } else if(LO.type == "warning") {
                console.warn(logString);
            } else if(LO.type == "info") {
                console.info(logString);
            } else {
                console.log(logString);
            }
        }
    };

    /**
     * @param {object} LO
     */
    this.stringifyLogObject = function(LO) {
        return("PPM[" + (LO.datetime?LO.datetime:LO.ts) + "]" +
            (LO.zone!=""?"("+LO.zone+")":"") +
            ": " + LO.msg
            );
    };

    /**
     * @param {object} LO
     */
    this.memorizeLogObject = function(LO) {
        this.logs.push(LO);
        if(this.logs.length > cfg.get("log_objects_to_keep")) {
            this.logs.splice(0, 1);
        }
    };

    this.getLogObject = function(msg, zone, type) {
        var LO = {};
        LO.index = cfg.set("log_index", cfg.get("log_index")+1);
        LO.ts = Date.now();
        LO.datetime = this.getHumanReadableDate(LO.ts, false, false, false);
        LO.zone = zone || "";
        LO.msg = msg;
        LO.type = (["error","warning","info","log"].indexOf(type)!=-1?type:"log");
        return(LO);
    };

    this.getHumanReadableDate = function(timestamp, showYr, showMth, showDay, showHr, showMin, showSec, showMSec) {
        showYr = showYr!=false;
        showMth = showMth!=false;
        showDay = showDay!=false;
        showHr = showHr!=false;
        showMin = showMin!=false;
        showSec = showSec!=false;
        showMSec = showMSec!=false;
        var answer = timestamp;
        var ts = parseInt(answer);
        var jsDate = new Date(ts);
        if(jsDate && jsDate instanceof Date) {
            answer = '' +
                (showYr?jsDate.getFullYear():'') +
                (showMth?"-"+(jsDate.getMonth()+1):'') +
                (showDay?"-"+jsDate.getDate()+" ":'') +
                (showHr?""+jsDate.getHours():'') +
                (showMin?":"+jsDate.getMinutes():'') +
                (showSec?"."+jsDate.getSeconds():'') +
                (showMSec?"."+jsDate.getMilliseconds():'') +
                '';
        }
        return(answer);
    }
}
