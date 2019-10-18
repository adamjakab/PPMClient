define([
    'angular',
    'underscore'
], function (angular, _) {
    angular.module('App').factory('cryptorFactory', function() {
        let PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
        let PPMCryptor = PPM.getComponent("CRYPTOR");
        return {
            getEncryptionSchemes: function() {
                return PPMCryptor.getRegisteredEncryptionSchemes();
            }
        };
    });
});
