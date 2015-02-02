define([
    'angular'
], function () {
    angular.module('optionsApp').controller('encryptionscheme.controller',
        function ($scope, settings, $state) {
            $scope.settings = settings;
            var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
            /** log shorthand */
            var log = function (msg, type) {
                PPM.getComponent("LOGGER").log(msg, "OPTIONS(encryptionscheme)", type);
            };



        }
    );
});