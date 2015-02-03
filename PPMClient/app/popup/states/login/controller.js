define([
    'angular'
], function () {
    angular.module('App').controller('login.controller',
        function ($scope, settings, $state, cryptorFactory) {
            $scope.settings = settings;
            var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
            var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
            var UTILS = PPM.getComponent("UTILS");
            /** log shorthand */
            var log = function (msg, type) {
                PPM.getComponent("LOGGER").log(msg, "POPUP(login)", type);
            };

            /**
             * Defaults
             */
            $scope.logged_in = PPM.isLoggedIn();
            $scope.profiles = CHROMESTORAGE.getAvailableProfiles();
            $scope.profile = "DEFAULT";
            $scope.schemes = cryptorFactory.getEncryptionSchemes();
            $scope.scheme = "OnePass";
            $scope.masterKey = "Paranoia";//@todo: unset default password(!TESTING ONLY!)


            /**
             * If user is not logged in redirect to "login" state
             */
            if (!$scope.logged_in && !$state.is("login")) {
                $state.go("login");
            }

            /**
             * If user is logged in redirect to "logout" state
             */
            if ($scope.logged_in && $state.is("login")) {
                $state.go("logout");
            }

            /**
             * Execute Login
             */
            $scope.login = function () {
                //window.close();//close popup
                PPM.login($scope.profile, $scope.scheme, $scope.masterKey).then(function () {
                    $scope.masterKey = "";
                    $scope.logged_in = CHROMESTORAGE.hasDecryptedSyncData();
                    $scope.$apply();
                    log("LOGIN OK");
                    $state.go("menu");
                }).error(function () {
                    log("LOGIN FAILED!");
                }).catch(Error, function () {
                    log("LOGIN FAILED!");
                });
            };

            /**
             * Execute Logout
             */
            $scope.logout = function () {
                //window.close();//close popup
                PPM.logout().then(function () {
                    $scope.masterKey = "";
                    $scope.logged_in = CHROMESTORAGE.hasDecryptedSyncData();
                    $scope.$apply();
                    log("LOGOUT OK");
                    UTILS.closeOptionsPage().then(function() {
                        PPM.initialize().then(function () {
                            //$state.go("login");
                            window.close();
                        });
                    });
                }).error(function () {
                    log("LOGOUT FAILED!");
                }).catch(Error, function () {
                    log("LOGOUT FAILED!");
                });
            }

        }
    );
});
