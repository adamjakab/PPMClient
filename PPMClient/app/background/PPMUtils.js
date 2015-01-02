/**
 * Generic utility methods
 */
define([
    'syncConfig',
    'PPMLogger',
    'bluebird',
    'underscore'
], function (syncConfig, logger, Promise, _) {
    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {logger.log(msg, "UTILS", type);};

    /**
     * Available characters to use for gibberish string
     * @type {{alphaUpper: string, alphaLower: string, numeric: string, special: string, extendedUpper: string, extendedLower: string}}
     */
    var CHAR_CLASSES = {
        "alphaUpper": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "alphaLower": "abcdefghijklmnopqrstuvwxyz",
        "numeric": "0123456789",
        "special": "#@?!|&%^*+-=.:,;/([{<>}])",
        "extendedUpper": "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß",
        "extendedLower": "àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ"
    };

    var connectionStateIcons = {
        unauthenticated: "images/state_icons/unauthenticated.png",
        authenticated: "images/state_icons/authenticated.png",
        connected: "images/state_icons/connected.png",
        disconnected: "images/state_icons/disconnected.png"
    };

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
         * Fires CustomEvent
         * @param {{}} eventData
         */
        dispatchCustomEvent: function(eventData) {
            if(_.isObject(eventData) && eventData.hasOwnProperty("type")) {
                log("Dispatching CustomEvent: " + JSON.stringify(eventData));
                var customEvent = new CustomEvent("PPM");
                customEvent.initCustomEvent("PPM", true, true, eventData);
                document.dispatchEvent(customEvent);
            } else {
                log("CustomEvent cannot be dispatched: " + JSON.stringify(eventData));
            }
        },

        /**
         * Sets PPM icon and badge text explicitly if set.
         * @param {string} [badgeText]
         * @param {string} [connectionState] - one of: unauthenticated, authenticated, connected, disconnected
         */
        updateStateIcon: function(badgeText, connectionState) {
            //SET BADGE TEXT
            if(!_.isNull(badgeText) && !_.isEmpty(badgeText)) {
                chrome.browserAction.setBadgeText({text: badgeText});
            }

            //SET ICON
            if(!_.isNull(connectionState) && !_.isEmpty(connectionState) && _.contains(_.keys(connectionStateIcons), connectionState)) {
                chrome.browserAction.setIcon({path:connectionStateIcons[connectionState]});
            }
        },

        /**
         * Opens options page in tab
         * @param {string} state
         * @return {Promise}
         */
        openOptionsPage: function(state) {
            return new Promise(function (fulfill, reject) {
                var matchPageUrl = "chrome-extension://"+chrome.runtime.id+"/app/options.html";
                var optionsPageUrl = matchPageUrl + (state ? '#/' + state : '');
                chrome.tabs.query({url:matchPageUrl}, function(tabs) {
                    if (tabs.length) {
                        var tab = tabs[0];
                        chrome.windows.getCurrent({populate:false}, function(win) {
                            if(tab.windowId == win.id) {
                                chrome.tabs.update(tab.id, {url: optionsPageUrl, active: true}, function(){
                                    fulfill();
                                });
                            } else {
                                chrome.tabs.move(tab.id, {windowId: win.id, index:-1}, function(tab) {
                                    chrome.tabs.update(tab.id, {url: optionsPageUrl, active: true}, function(){
                                        fulfill();
                                    });
                                });
                            }
                        });
                    } else {
                        chrome.tabs.create({url: optionsPageUrl}, function(){
                            fulfill();
                        });
                    }
                });
            });
        },

        /**
         * Closes options page in tab
         * @return {Promise}
         */
        closeOptionsPage: function() {
            return new Promise(function (fulfill, reject) {
                var matchPageUrl = "chrome-extension://" + chrome.runtime.id + "/app/options.html";
                chrome.tabs.query({url: matchPageUrl}, function (tabs) {
                    if (tabs.length) {
                        var tab = tabs[0];
                        chrome.tabs.remove(tab.id, function() {
                            log("closed options page");
                            fulfill();
                        });
                    } else {
                        fulfill();
                    }
                });
            });
        },

        /**
         * Pads a string on both sides with lft and rgt number of random(hex) chars
         * @param {string} str
         * @param {int} lft
         * @param {int} rgt
         * @returns {string}
         */
        leftRightPadString: function(str, lft, rgt) {
            var options = {
                "alphaUpper": false,
                "alphaLower": false,
                "numeric": true,
                "special": false,
                "extendedUpper": false,
                "extendedLower": false,
                "extra": true,
                "extraChars": "abcdef"
            };
            var uglyLeft = this.getGibberish(lft, lft, options);
            var uglyRight = this.getGibberish(rgt, rgt, options);
            return(uglyLeft + str + uglyRight);
        },

        /**
         * Removes padding chars on both sides of input string
         * @param {*} str
         * @param {int} lft
         * @param {int} rgt
         * @returns {string}
         */
        leftRightTrimString: function(str, lft, rgt) {
            return(str.substr(lft,(str.length)-lft-rgt));
        },

        /**
         * Returns a variable length very ugly string
         * @param {int} minLength - if not set if will default to 0
         * @param {int} [maxLength] - if not set if will default to minLength(will return empty string)
         * @param {{}} [options] - options to set which character classes to use
         * @returns {string}
         */
        getGibberish: function(minLength, maxLength, options) {
            var config = {
                "alphaUpper": true,
                "alphaLower": true,
                "numeric": true,
                "special": true,
                "extendedUpper": true,
                "extendedLower": true,
                "extra": false,
                "extraChars": ""
            };
            _.extend(config, options);
            if(config["extraChars"].length==0) {
                config["extra"] = false;
            }
            // calculate length
            minLength = Math.abs(minLength) || 0;
            maxLength = Math.abs(maxLength) || minLength;
            if(maxLength == 0) {return '';}
            if(maxLength<minLength) {maxLength=minLength;}
            var finalLength = this.getRandomNumberInRange(minLength, maxLength);
            //
            var numEnabledClasses = 0;
            _.each(config, function(isActive) {
                numEnabledClasses = numEnabledClasses + ( isActive===true ? 1 : 0);
            });
            if(numEnabledClasses == 0) {
                return '';
            }
            //
            var lengthPerClass = Math.floor(finalLength/numEnabledClasses)+1;
            var classLength = {
                alphaUpper:     (config["alphaUpper"] ? lengthPerClass : 0),
                alphaLower:     (config["alphaLower"] ? lengthPerClass : 0),
                numeric:        (config["numeric"] ? lengthPerClass : 0),
                special:        (config["special"] ? lengthPerClass : 0),
                extendedUpper:  (config["extendedUpper"] ? lengthPerClass : 0),
                extendedLower:  (config["extendedLower"] ? lengthPerClass : 0),
                extra:          (config["extra"] ? lengthPerClass : 0)
            };
            //
            var classTypes = _.keys(classLength);
            var currentType, currentChars;
            var answer = '';
            do {
                var remainingChars = _.reduce(classLength, function(memo, num){ return memo + num; }, 0);
                currentType = _.sample(classTypes);
                if(classLength[currentType] > 0) {
                    currentChars = (currentType != "extra" ? CHAR_CLASSES[currentType] : config["extraChars"]);
                    answer += currentChars[this.getRandomNumberInRange(0, currentChars.length-1)];
                    classLength[currentType]--;
                }
            } while(remainingChars>0);
            if(answer.length > finalLength) {
                answer = answer.substr(0, finalLength);
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