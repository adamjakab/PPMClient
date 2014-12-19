/**
 * Generic utility methods
 */
define([
    'config',
    'PPMLogger',
    'bluebird'
], function (cfg, logger, Promise) {
    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {logger.log(msg, "UTILS", type);};

    return {
        /**
         * Initialize component
         * @returns {Promise}
         */
        initialize: function() {
            return new Promise(function (fulfill, reject) {
                log("INITIALIZED", "info");
                fulfill();
            });
        },

        /**
         * Shut down component
         * @returns {Promise}
         */
        shutdown: function() {
            return new Promise(function (fulfill, reject) {
                log("SHUTDOWN COMPLETED", "info");
                fulfill();
            });
        },

        /**
         * Returns a very ugly string
         * @param {int} minLength - if not set if will default to 0
         * @param {int} [maxLength] if not set if will default to minLength
         * @param {boolean} [useSpecial=false]
         * @returns {string}
         */
        getGibberish: function(minLength, maxLength, useSpecial) {
            var ugly_chars = {
                "alpha": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
                "numeric": "0123456789",
                "special": "#@?!|&%^*+-=.:,;/([{<>}])"
            };
            useSpecial = (useSpecial===true);
            minLength = minLength || 0;
            maxLength = maxLength || minLength;
            var length = this.getRandomNumberInRange(minLength, maxLength);
            //
            var charTypes = ["alpha","numeric"];
            if(useSpecial) {
                charTypes.push("special");
            }
            //
            var lengthPerType = Math.floor(length/charTypes.length);
            var typeLength = [];
            typeLength["alpha"] = lengthPerType;//ALPHA
            typeLength["numeric"] = (useSpecial ? lengthPerType : length-(lengthPerType));//NUMERIC
            typeLength["special"] = (useSpecial ? length-(2*lengthPerType) : 0);//SPECIAL
            //
            var answer = '';
            var t, chars;
            while(answer.length < length) {
                t = charTypes[Math.floor(Math.random() * charTypes.length)];
                if(t) {
                    typeLength[t]--;
                    if(!typeLength[t]) {
                        charTypes.splice(charTypes.indexOf(t),1);
                    }
                    chars = ugly_chars[t];
                    answer += chars[Math.floor(chars.length*Math.random())];
                } else {
                    throw new Error("no type!");
                }

            }
            return(answer);
        },

        /**
         * Returns a number N where N is between min and max (inclusive, ie. N can be min or max)
         * @param {number} min
         * @param {number} max
         * @returns {number}
         */
        getRandomNumberInRange: function(min, max) {
            return(min + Math.round(Math.random()*(max-min)));
        }


    };
});