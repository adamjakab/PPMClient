define([
    'angular'
], function () {
    angular.module('optionsApp').controller('log.controller',
        function ($scope, settings, $state, $interval, logFactory) {
            $scope.settings = settings;
            var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
            var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
            var LOGGER = PPM.getComponent("LOGGER");
            /** log shorthand */
            var log = function (msg, type) {
                LOGGER.log(msg, "OPTIONS(log)", type);
            };

            //the log items
            $scope.logItems = logFactory.getLogObjects();

            /**
             * Auto update logItems on regular time intervals
             */
            var updateLogItemsPromise = $interval(function() {
                    $scope.logItems = logFactory.getLogObjects();
            }, 1000);

            /**
             * Clean up when leaving the controller
             */
            $scope.$on("$destroy", function() {
                $interval.cancel(updateLogItemsPromise);
            });

        }
    );
});