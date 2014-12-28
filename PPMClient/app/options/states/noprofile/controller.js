define([
    'angular'
], function () {
    angular.module('app').controller('noprofile.controller',
        function ($scope, settings, $state) {
            $scope.settings = settings;
            var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
            var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
            var UTILS = PPM.getComponent("UTILS");
            /** log shorthand */
            var log = function (msg, type) {
                PPM.getComponent("LOGGER").log(msg, "OPTIONS(info)", type);
            };

            /**
             * Defaults
             */
            $scope.logged_in = PPM.isLoggedIn();



        }
    );
});