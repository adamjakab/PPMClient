/**
 * Path-based Options holder (path is dot separated like: node.sub)
 * @param {Object} options
 * @param {function} [logger]
 * @constructor
 */
function ConfigOptions(options, logger) {
    /**
     * All options will be stored here
     * @type {Object}
     * @private
     */
    var _OPT = {};

    /**
     * The logger function
     * @type {function|null}
     */
    var _logger = logger;

    var _log = function(msg) {
        if(typeof _logger == "function") {
            _logger.call(this, "CO: " + msg);
        }
    };

    /**
     * Try to identify js variable type
     * source: http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/     *
     * @param {*} param
     * @returns {string}
     * @private
     */
    var _getType = function(param) {
        return ({}).toString.call(param).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };


    /**
     * will take a dot-separated path (x.y.z)
     * and return the next element "x" and the remaining elements "y.z"
     * If there are no remaining elements then it will set remaining to false
     *
     * @param {string} key
     * @returns {} - format:  {"key":"x", remaining:"y.x"}
     * @private
     */
    var _getKeyPath = function(key) {
        var answer = {"key":null, remaining:false};
        if(key.match(/^[^.]*\..*$/)) {
            var unpacked = key.split(".");
            answer["key"] = unpacked.splice(0,1)[0];
            for (var i=0; i<unpacked.length; i++) {if(unpacked[i]=="") {unpacked.splice(i,1);}}
            answer["remaining"] = unpacked.join(".");
            answer["remaining"] = (answer["remaining"]!=""?answer["remaining"]:false);
        } else {
            answer["key"] = key;
        }
        return(answer);
    };

    /**
     * Merge additional options to current object and return boolean to indicate if current object has changed
     * @param {object} options
     * @param {boolean} [force] - if true values in options object will overwrite the current ones (default: false)
     * @returns boolean
     */
    this.merge = function(options, force) {
        force = (force===true);
        var hasChanges = false;
        if (_getType(options) == "object") {
            for (var key in options) {
                if (options.hasOwnProperty(key)) {
                    if(_OPT.hasOwnProperty(key) === false || force) {
                        this.set(key, options[key]);
                        hasChanges = true;
                    }
                }
            }
        }
        return hasChanges;
    };

    /**
     * Get option value
     * @param {string} key
     * @param {*} [defVal]
     * @returns {*}
     */
    this.get = function(key, defVal) {
        var answer = (_getType(defVal) != "undefined" ? defVal : null);
        var KP = _getKeyPath(key);
        if (KP["remaining"] === false) {
            if(_OPT.hasOwnProperty(key)) {
                answer = _OPT[key];
            }
        } else {
            if(_OPT.hasOwnProperty(KP["key"]) && _getType(_OPT[KP["key"]]) == "object" && _OPT[KP["key"]] instanceof ConfigOptions) {
                answer = _OPT[KP["key"]].get(KP["remaining"]);
            }
        }
        return(answer);
    };

    /**
     * Set option value
     * @param {string} key
     * @param {*} val
     * @returns {*}
     */
    this.set = function(key, val) {
        //_log("Setting key("+key+") to value: " + val);
        var oldVal = this.get(key);
        var KP = _getKeyPath(key);
        if (KP["remaining"] === false) {
            var vT = _getType(val);
            switch(vT) {
                case "undefined":
                    _log("Key("+key+") value("+val+") is of type: " + vT + " - DELETING!");
                    delete _OPT[key];
                    break;
                case "string":
                case "number":
                case "boolean":
                case "null":
                    _log("Key("+key+") value("+val+") is of type: " + vT + " - ADDING");
                    _OPT[key] = val;
                    break;
                case "object":
                    if(val instanceof ConfigOptions) {
                        _log("Key("+key+") is of type: " + vT + "/ConfigOptions - ADDING");
                        _OPT[key] = val;
                    } else {
                        _log("Key("+key+") value("+JSON.stringify(val)+") is of type: " + vT + " - CASTING TO ConfigOptions");
                        _OPT[key] = new ConfigOptions(val, _logger);
                    }
                    break;
                default:
                    _log("Unknown key type("+vT+") for key("+key+") with value("+val+")! Skipped!");
                    break;
            }
        } else {
            if(!(_OPT.hasOwnProperty(KP["key"]) && _getType(_OPT[KP["key"]]) == "object" && _OPT[KP["key"]] instanceof ConfigOptions)) {
                _OPT[KP["key"]] = new ConfigOptions({}, _logger);
            }
            _OPT[KP["key"]].set(KP["remaining"], val);
        }
        return(oldVal);
    };

    /**
     * get all keys
     * @returns {Array}
     */
    this.getKeys = function() {
        var answer = [];
        for (var key in _OPT) {
            if(_OPT.hasOwnProperty(key)) {
                answer.push(key);
            }
        }
        return answer;
    };

    /**
     * Returns all values recursively
     * @param {boolean} [showTypes]
     * @returns {{}}
     */
    this.getRecursiveOptions = function(showTypes) {
        showTypes = (showTypes===true);
        var tmp = {};
        for (var key in _OPT) {
            if(_OPT.hasOwnProperty(key)) {
                if(_getType(_OPT[key]) == "object" && _OPT[key] instanceof ConfigOptions) {
                    tmp[key] = _OPT[key].getRecursiveOptions(showTypes);
                } else {
                    if(showTypes) {
                        tmp[key] = {"type":_getType(_OPT[key]), "value":_OPT[key]};
                    } else {
                        tmp[key] = _OPT[key];
                    }
                }
            }
        }
        return(tmp);
    };

    //init with setup parameters
    this.merge(options);
}