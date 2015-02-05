/**
 * Generic test utility methods used by Specs
 */
define([
    'bluebird'
], function (Promise) {
    return {
        /**
         * Check if object is a bluebird Promise
         * @param {{}} obj
         */
        isPromise: function(obj) {
            expect(obj).toBeDefined();
            expect(obj instanceof Promise).toBeTruthy();
            expect(obj.then).toBeDefined();
            expect(obj.error).toBeDefined();
            expect(obj.catch).toBeDefined();
        }


    };
});