/**
 * ConfigOptions
 *
 * Path-based Options holder (path is dot separated like: node.sub)
 */
define(['underscore'], function (_) {

    /**
     * Try to identify js variable type
     * source: http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
     * @param {*} param
     * @returns {string}
     * @private
     */
    var _getType = function(param) {
        return ({}).toString.call(param).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };

    /**
     * splits a dot-separated path (x.y.z)
     * to an array of elements
     *
     * @param {string} key
     * @returns []
     * @private
     */
    var _getKeyElements = function(key) {
        var answer = [];
        if(_.isString(key)) {
            if(key.match(/^[^.]*\..*$/)) {
                answer = key.split(".");
            } else {
                answer.push(key);
            }
        }
        return(answer);
    };


    /**
     *
     * @param {object} [options]
     * @constructor
     */
    var ConfigOptions = function(options) {
        /**
         * All options will be stored here
         * @type {Object}
         * @private
         */
        var _OPT = {};

        /**
         * Set option value
         * @param {string} key
         * @param {*} val
         * @returns {*}
         */
        this.set = function(key, val) {
            var oldValue = this.get(key);
            var keyElements = _getKeyElements(key);
            while(keyElements.length != 0) {
                var currentKey = keyElements.pop();
                var currentValueObject = {};
                currentValueObject[currentKey] = val;
                val = currentValueObject;
            }
            this.merge(val);
            return(oldValue);
        };

        /**
         * @param {string} key
         * @param {*} [defaultValue]
         * @returns {*}
         */
        this.get =function(key, defaultValue) {
            var keyElements = _getKeyElements(key);
            var currentValueObject = _OPT;
            while(!_.isNull(currentValueObject) && keyElements.length != 0) {
                var currentKey = _.first(keyElements);
                keyElements = _.rest(keyElements);
                if(currentValueObject.hasOwnProperty(currentKey)) {
                    currentValueObject = currentValueObject[currentKey];
                } else {
                    currentValueObject = null;
                }
            }
            return(!_.isNull(currentValueObject) ? currentValueObject : defaultValue);
        };


        this.merge = function(source) {
            _.extend(_OPT, source);
        };

        this.dump = function() {
            console.log("_OPTIONS: " + JSON.stringify(_OPT));
        };


        this.merge(options);
    };
    return ConfigOptions;
});