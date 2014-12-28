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

            /**
             * Defaults
             */
            $scope.logged_in = PPM.isLoggedIn();

            /**
             * If user is not logged in redirect to "noprofile" state
             */
            if (!$scope.logged_in && !$state.is("noprofile")) {
                $state.go("noprofile");
            }

            /**
             * form can work on any property of the sync options
             * except for server settings which has specific controller
             */
            var SyncConfig = CHROMESTORAGE.getConfigByLocation("sync");
            $scope.CFG = SyncConfig.getAll();


            /**
             * Temporary - todo: remove me!
             */
            $scope.dumpConfig = function() {
                var cfgStr = JSON.stringify(SyncConfig.getAll());
                log(cfgStr);
            }
        }
    );
});