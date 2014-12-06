define([
    'angular'
], function () {
    angular.module('app').controller('menu.controller',
        function ($scope, settings, $state) {
            $scope.settings = settings;
            var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
            var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
            var UTILS = PPM.getComponent("UTILS");
            /** log shorthand */
            var log = function (msg, type) {
                PPM.getComponent("LOGGER").log(msg, "POPUP(menu)", type);
            };

            /**
             * Defaults
             */
            $scope.logged_in = CHROMESTORAGE.isInitialized();
            $scope.passcards = [
                {name: "Passcard #1"},
                {name: "Passcard #2"},
                {name: "Passcard #3"}
            ];

            /*
             * If user is not logged in redirect to "login" state
             */
            if (!$scope.logged_in && !$state.is("login")) {
                $state.go("login");
            }

            /**
             * @param {object} PC
             */
            $scope.fillInPasscard = function (PC) {
                log("FILL IN PASSCARD: " + PC.name);
            };

            /**
             * @param {object} PC
             */
            $scope.copyUsername = function (PC) {
                log("COPY USERNAME: " + PC.name);
            }
        }
    );
});