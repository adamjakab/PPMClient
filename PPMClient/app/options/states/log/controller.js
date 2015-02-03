define([
    'angular'
], function () {
    angular.module('App').controller('log.controller',
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
             * PPM CustomEvent Listener - listens to events dispatched in background
             */
            var customEventListener = function(e) {
                if(e && _.isObject(e.detail)) {
                    var eventData = e.detail;
                    switch (eventData.type) {
                        case "new_log_object":
                            $scope.$apply(function() {
                                $scope.logItems = logFactory.getLogObjects();
                            });
                            break;
                    }
                }
            };

            //add listener to background document
            chrome.extension.getBackgroundPage().document.addEventListener("PPM", customEventListener, false);

            /**
             * Clean up when leaving the controller
             */
            $scope.$on("$destroy", function() {
                chrome.extension.getBackgroundPage().document.removeEventListener("PPM", customEventListener, false);
            });

            /**
             * Make sure when closing options tab $scope gets destroyed
             */
            window.onbeforeunload = function() {
                $scope.$destroy();
            }

        }
    );
});