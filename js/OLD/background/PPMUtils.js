/**
 * Various utility functions
 * @param {ParanoiaPasswordManager} PPM
 * @param {object} [options]
 */
function PPMUtils(PPM, options) {
    var cfg = new ConfigOptions({
        close_config_tab_on_logout: false
    });
    cfg.merge(options);

    var log = function(msg, type) {PPM.getComponent("LOGGER").log(msg, "PPMUtils", type);};

    this.init = function() {
        log("INITIALIZED: " + JSON.stringify(cfg.getRecursiveOptions()), "info");
    };


    this.findAndCloseConfigurationTab = function(cb) {
        var self = this;
        var configPageUrl = "chrome-extension://"+chrome.runtime.id+"/options.html";
        chrome.tabs.query({url:configPageUrl}, function(tabs) {
            if (tabs.length) {
                if(cfg.get("close_config_tab_on_logout")) {
                    var tab = tabs[0];
                    chrome.tabs.remove(tab.id, cb);
                }
            } else {
                if(self.isFunction(cb)) {cb();}
            }
        });
    };

    /**
     * Sets PPM icon and badge text explicitly if set.
     * If not set, Will check states of paranoia main components and server states and set icon accordingly
     * @param {string} [badgeText]
     * @param {string} [connectionState]
     */
    this.updateStateIcon = function(badgeText, connectionState) {
        /** @type ChromeStorage CHROMESTORAGE */
        var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
        /** @type PPMStorage PPMSTORAGE */
        var PPMSTORAGE = PPM.getComponent("PPMSTORAGE");
        var iconFolder = '../images/state_icons/';
        var connectionStateIcons = {
            unauthenticated: iconFolder + "offline.png",
            loading: iconFolder + "initing.png",
            connected: iconFolder + "ready.png",
            disconnected: iconFolder + "error.png"
        };
        //SET BADGE TEXT
        badgeText = (badgeText?badgeText:"");
        chrome.browserAction.setBadgeText({text: badgeText});
        //SET ICON
        if (!connectionState || connectionState=="undefined") {
            if(CHROMESTORAGE && CHROMESTORAGE.isInited()) {
                connectionState = "loading";
                if(PPMSTORAGE && PPMSTORAGE.isInited()) {
                    connectionState = "connected";
                } else if (PPMSTORAGE && PPMSTORAGE.isInitialDataIndexLoaded() && !PPMSTORAGE.areAllServersConnected()) {
                    connectionState = "disconnected";
                }
            }
        }
        if (!connectionStateIcons.hasOwnProperty(connectionState)) {
            connectionState = "unauthenticated";
        }
        chrome.browserAction.setIcon({path:connectionStateIcons[connectionState]});
    };

    /**
     * Fires CustomEvent listened for in main PPM
     * @param {{}} details
     */
    this.dispatchCustomEvent = function(details) {
        if(details && details.hasOwnProperty("type")) {
            document.dispatchEvent(new CustomEvent("PPM", {
                detail: details, bubbles: true, cancelable: true
            }));
            log("Dispatched customEvent: " + JSON.stringify(details));
        } else {
            log("customEvent cannot be dispatched: " + JSON.stringify(details));
        }
    };


    /**
     *
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    this.getRandomNumberInRange = function(min, max) {
        return(min + Math.round(Math.random()*(max-min)));
    };


    /**
     * Returns a very ugly string
     * @param {int} minLength
     * @param {int} [maxLength] will be same as minLength
     * @param {boolean} [useSpecial=false]
     * @returns {string}
     */
    this.getUglyString = function(minLength, maxLength, useSpecial) {
        var ugly_chars = {
            "alpha": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
            "numeric": "0123456789",
            "special": "#@?!|&%^*+-=.:,;/([{<>}])"
        };
        minLength = minLength || 16;
        maxLength = maxLength || minLength;
        var length = minLength + Math.round((maxLength-minLength)*Math.random());
        //
        useSpecial = (useSpecial===true);
        var typeLength = [];
        typeLength["alpha"] = Math.floor(length/(useSpecial?3:2));//ALPHA
        typeLength["numeric"] = (useSpecial?typeLength["alpha"]:length-typeLength["alpha"]);//NUMERIC
        typeLength["special"] = (useSpecial?length-typeLength["alpha"]-typeLength["numeric"]:0);//SPECIAL
        var charTypes = ["alpha","numeric"];
        if(useSpecial) {
            charTypes.push("special");
        }
        //console.log("L(tot):"+length+" L(alpha):"+typeLength["alpha"] + " L(num):"+typeLength["numeric"] + " L(spec):"+typeLength["special"]);

        var answer = '';
        var t, chars;
        var i = 0;
        while(answer.length < length) {
            i++;
            if(i>(length*2))break;//emergency break to avoid infinity loop
            t = charTypes[Math.floor(Math.random() * charTypes.length)];
            typeLength[t]--;
            if(!typeLength[t]) {
                charTypes.splice(charTypes.indexOf(t),1);
            }
            chars = ugly_chars[t];
            answer += chars[Math.floor(chars.length*Math.random())];
        }
        return(answer);
    };


    /**
     * Pads a string on both sides with lft and rgt number of random(crypted-like) chars
     * @param {string} str
     * @param {int} lft
     * @param {int} rgt
     * @returns {string}
     */
    this.leftRightPadString = function(str, lft, rgt) {
        /** @type PPMCryptor CRYPTOR */
        var CRYPTOR = PPM.getComponent("CRYPTOR");
        var ugly = this.getUglyString((lft>rgt?lft:rgt)*2);
        var leftChars = CRYPTOR.encrypt(ugly, ugly).substr(0, lft);
        var rightChars = CRYPTOR.encrypt(ugly, ugly).slice(rgt*-1);
        return(leftChars + str + rightChars);
    };

    /**
     * Removes random padding chars on both sides
     * @param {string} str
     * @param {int} lft
     * @param {int} rgt
     * @returns {string}
     */
    this.leftRightTrimString = function(str, lft, rgt) {
        return(str.substr(lft,(str.length)-lft-rgt));
    };


    /** todo: it doesn't seem right, hmmmmm...
     * Checks if passed parameter is an OBJECT
     * @param {*} param
     * @returns {boolean}
     */
    this.isObject = function(param) {
        return (!!param) && (param.constructor === Object);
    };

    /** todo: it doesn't seem right, hmmmmm...
     * Checks if passed parameter is an ARRAY
     * @param {*} param
     * @returns {boolean}
     */
    this.isArray = function(param) {
        return (!!param) && (param.constructor === Array);
    };

    /**
     * Checks if passed parameter is a FUNCTION
     * @param {*} param
     * @returns {boolean}
     */
    this.isFunction = function(param) {
        return !!(param && param.constructor && param.call && param.apply);
    };

    /**
     * Try to identify js variable type
     * source: http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
     * @param {*} param
     * @returns {string}
     */
    this.getType = function(param) {
        return ({}).toString.call(param).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }
}

