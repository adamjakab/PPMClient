define([
    'angular'
], function () {
    angular.module('optionsApp').controller('log.controller',
        function ($scope, settings, $state, $timeout) {
            $scope.settings = settings;
            var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
            var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
            var LOGGER = PPM.getComponent("LOGGER");
            /** log shorthand */
            var log = function (msg, type) {
                LOGGER.log(msg, "OPTIONS(log)", type);
            };

            /**
             * Defaults
             */
            $scope.logged_in = PPM.isLoggedIn();
            $scope.logItems = LOGGER.getLogObjects();

            /**
             * If user is not logged in redirect to "noprofile" state
             */
            if (!$scope.logged_in && !$state.is("noprofile")) {
                $state.go("noprofile");
            }

            /**
             * Auto refresh
             * todo: probably this is not needed if we set up a provider
             */
            var stop;
            var autorefreshLogs = function() {
                stop = $timeout(function() {
                    autorefreshLogs();
                }, 1000);
            };
            autorefreshLogs();


        }
    );
});