define([
    'angular'
], function () {
    angular.module('popupApp').controller('menu.controller',
        function ($scope, settings, $state, $interval, secretFactory) {
            $scope.settings = settings;
            var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
            var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
            var UTILS = PPM.getComponent("UTILS");
            /** log shorthand */
            var log = function (msg, type) {
                PPM.getComponent("LOGGER").log(msg, "POPUP(menu)", type);
            };

            /**
             * Check access
             * If user is not logged in redirect to "login" state
             */
            $scope.logged_in = PPM.isLoggedIn();
            if (!$scope.logged_in) {
                $state.go("login");
            }

            $scope.passcards = secretFactory.getSecrets();




            /**
             * @param {String} id
             */
            $scope.fillInPasscard = function(id) {
                log("FILL IN PASSCARD: " + id);
                secretFactory.getSecret(id).then(function(secretData) {




                }).catch(function(e) {
                    log("Cannot copy password: " + e.message);
                });
            };

            /**
             * @param {String} id
             */
            $scope.editPasscard = function(id) {
                log("EDIT PASSCARD: " + id);
            };

            /**
             * @param {String} id
             */
            $scope.copyPassword = function(id) {
                //log("COPY PASSWORD: " + id);
                secretFactory.getSecret(id).then(function(secretData) {
                    UTILS.copyTextToClipboard(secretData.password);
                    //@todo: we need some sort of visible confirmation that it was done
                }).catch(function(e) {
                    log("Cannot copy password: " + e.message);
                });
            };

            /**
             * @param {String} id
             */
            $scope.copyUsername = function(id) {
                //log("COPY USERNAME: " + id);
                secretFactory.getSecret(id).then(function(secretData) {
                    UTILS.copyTextToClipboard(secretData.username);
                    //@todo: we need some sort of visible confirmation that it was done
                }).catch(function(e) {
                    log("Cannot copy username: " + e.message);
                });
            };

            /**
             *
             */
            $scope.openPasswordGenerator = function() {
                log("Password Generator");
            };

            /**
             *
             */
            $scope.registerNewPasscard = function() {
                log("Register New Passcard");
            };


            /**
             * Opens options page on the requested tab
             * @param {String} tabName
             */
            $scope.openOptionsTab = function(tabName) {
                UTILS.openOptionsPage(tabName).then(function() {
                    window.close();//close popup
                });
            };

        }
    );
});