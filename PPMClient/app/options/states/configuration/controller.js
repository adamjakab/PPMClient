define([
    'angular'
], function () {
    angular.module('app').controller('configuration.controller',
        function ($scope, settings, $state) {
            $scope.settings = settings;
            var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
            var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
            var UTILS = PPM.getComponent("UTILS");
            /** log shorthand */
            var log = function (msg, type) {
                PPM.getComponent("LOGGER").log(msg, "OPTIONS(configuration)", type);
            };

            /*
             * If user is not logged in redirect to "noprofile" state
             */
            if (!CHROMESTORAGE.isInitialized() && !$state.is("noprofile")) {
                $state.go("noprofile");
            }

            /**
             * form can work on any propery of the sync options
             * except for server settings which has specific controller
             */
            $scope.CFG = CHROMESTORAGE.get("sync");
        }
    );
});