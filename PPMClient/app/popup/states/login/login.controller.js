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

        /*
         * If user is not logged in redirect to "login" state
         */
        if(!$scope.logged_in && !$state.is("login")) {
            $state.go("login");
        }

        /*
         * If user is logged in redirect to "logout" state
         */
        if($scope.logged_in && $state.is("login")) {
            $state.go("logout");
        }

        /**
         * Execute Login
         */
        $scope.login = function() {
            //window.close();//close popup
            PPM.login($scope.profile, $scope.masterKey).then(function() {
                $scope.masterKey = "";
                $scope.logged_in = CHROMESTORAGE.isInitialized();
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
        $scope.logout = function() {
            //window.close();//close popup
            PPM.logout().then(function() {
                $scope.masterKey = "";
                $scope.logged_in = CHROMESTORAGE.isInitialized();
                $scope.$apply();
                log("LOGOUT OK");
                $state.go("login");
            }).error(function () {
                log("LOGOUT FAILED!");
            }).catch(Error, function () {
                log("LOGOUT FAILED!");
            });
        }

});