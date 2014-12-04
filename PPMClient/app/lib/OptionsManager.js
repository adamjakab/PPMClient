/**
 * OptionsManager
 *
 * Path-based Options holder
 */
define(['underscore'],
    /**
     * @param _
     * @return {OptionsManager}
     */
    function (_) {
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
     * @param {object} [options]
     * @constructor
     */
    function OptionsManager(options) {
        /**
         * All options will be stored here
         * @type {Object}
         * @private
         */
        var _OPT = {};

        /**
         * Set option value and return old value
         * @param {string} key - a dot separated path to element like "sync.cryptor.bits"
         * @param {*} val
         * @returns {*}
         */
        this.set = function(key, val) {
            var oldValue = this.get(key);
            var keyElements = _getKeyElements(key);
            var currentItem = _OPT;
            var usedKeyElements = [];
            var currentKey, usedKeyChain, isLastElement;
            while(keyElements.length != 0) {
                currentKey = _.first(keyElements);
                usedKeyElements.push(currentKey);
                usedKeyChain = usedKeyElements.join(".");
                keyElements = _.rest(keyElements);
                isLastElement = (keyElements.length == 0);
                if(!isLastElement) {
                    if(!currentItem.hasOwnProperty(currentKey) || !_.isObject(currentItem[currentKey])) {
                        currentItem[currentKey] = {};
                    }
                } else {
                    currentItem[currentKey] = val;
                }
                currentItem = this.get(usedKeyChain);
            }
            return(oldValue);
        };

        /**
         * @param {string} key
         * @param {*} [defaultValue]
         * @returns {*}
         */
        this.get = function(key, defaultValue) {
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

        this.getAll = function() {
            return _OPT;
        };

        /**
         * @param {object} source
         * @param {string} [key]
         * @returns {boolean} - returns true if _OPT has changed
         */
        this.merge = function(source, key) {
            var original = _.extend(_OPT, {});
            if(!key) {
                _OPT = _.extend(_OPT, source);
            } else {
                this.set(key, _.extend(this.get(key), source));
            }
            return(!_.isEqual(original, _OPT));
        };

        this.merge(options);
    }
    return(OptionsManager);
});