/**
 * Logger Interface and Log keeper for in-app log management
 */
define([
    'syncConfig'
], function (syncConfig) {
    /**
     * @type {Array}
     */
    var logs = [];

    /**
     * @type {number}
     */
    var log_index = 0;

    /**
     * @param {string} msg
     * @param {string} [zone]
     * @param {string} [type]
     */
    var getLogObject = function(msg, zone, type) {
        var LO = {};
        LO.index = log_index++;
        LO.ts = Date.now();
        LO.datetime = getHumanReadableDate(LO.ts, false, false, false);
        LO.zone = zone || "";
        LO.msg = msg;
        LO.type = (["error","warning","info","log"].indexOf(type)!=-1?type:"log");
        return(LO);
    };

    /**
     * @param {object} LO
     */
    var stringifyLogObject = function(LO) {
        return("PPM[" + (LO.datetime?LO.datetime:LO.ts) + "]" +
            "[#"+LO.index+"]" +
            (LO.zone!=""?"("+LO.zone+")":"") +
            ": " + LO.msg
        );
    };

    /**
     * @param {object} LO
     */
    var memorizeLogObject = function(LO) {
        logs.push(LO);
        if(logs.length > syncConfig.get("logger.log_objects_to_keep")) {
            logs.splice(0, 1);
        }
        //
        /**
         * Dispatch CustomEvent of type: new_log_object
         * Note: we cannot use PPMUtils(dispatchCustomEvent) here because PPMLogger
         * is a requirejs dependency of PPMUtils so it would create a circular dependency
         */
        var customEvent = document.createEvent('CustomEvent');
        customEvent.initCustomEvent("PPM", true, true, {type: 'new_log_object'});
        document.dispatchEvent(customEvent);
    };



    var getHumanReadableDate = function(timestamp, showYr, showMth, showDay, showHr, showMin, showSec, showMSec) {
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
    };



    return {
        /**
         * @param {string} msg
         * @param {string} [zone]
         * @param {string} [type]
         */
        log: function(msg, zone, type) {
            var LO = getLogObject(msg, zone, type);
            memorizeLogObject(LO);
            if (syncConfig.get("logger.do_console_logging")) {
                var logString = stringifyLogObject(LO);
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
        },

        getLogObjects: function() {
            return logs;
        },

        resetLogObjects: function() {
            logs = [];
            log_index = 0;
        }
    };
});