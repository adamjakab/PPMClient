define([
    'angular'
], function () {
    angular.module('optionsApp').factory('logFactory', function() {
        var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
        var LOGGER = PPM.getComponent("LOGGER");

        return {
            getLogObjects: function() {
                return LOGGER.getLogObjects();
            }
        };
    });
});
