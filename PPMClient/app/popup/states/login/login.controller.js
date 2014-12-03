angular.module('app').controller('login.controller',
    function($scope, settings, $state) {
        $scope.settings = settings;
        var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
        var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
        var UTILS = PPM.getComponent("UTILS");
        /** log shorthand */
        var log = function(msg, type) {PPM.getComponent("LOGGER").log(msg, "POPUP(login)", type);};

        /**
         * Defaults
         */
        $scope.logged_in = CHROMESTORAGE.isInitialized();
        $scope.profile = "DEFAULT";
        $scope.masterKey = "";
        $scope.profiles = CHROMESTORAGE.getAvailableProfiles();//["DEFAULT", "Profile-1", "Profile-2"];


        $scope.login = function() {
            window.close();//close popup

            //todo: we need a Promise here
            PPM.login($scope.profile, $scope.masterKey).then(function() {
                $scope.masterKey = "";
                $scope.logged_in = CHROMESTORAGE.isInitialized();
                $scope.$apply();
                log("LOGIN OK");
            }).error(function () {
                log("LOGIN FAILED!");
            }).catch(Error, function () {
                log("LOGIN FAILED!");
            });


        };

        $scope.logout = function() {
            console.log("LOGOUT");
        }

});