define([
    'angular',
    'underscore'
], function (angular, _) {


    angular.module('App').factory('cryptorFactory', function() {

        console.log("cryptorFactory accessing background...");

        var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
        var PPMCryptor = PPM.getComponent("CRYPTOR");

        return {
            getEncryptionSchemes: function() {
                return PPMCryptor.getRegisteredEncryptionSchemes();
            }
        };
    });
});
