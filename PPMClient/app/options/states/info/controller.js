angular.module('app').controller('info.controller',
    function($scope, settings, $state) {
        $scope.settings = settings;
        var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
        var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
        var UTILS = PPM.getComponent("UTILS");
        /** log shorthand */
        var log = function(msg, type) {PPM.getComponent("LOGGER").log(msg, "OPTIONS(info)", type);};

        /**
         * Defaults
         */
        $scope.logged_in = CHROMESTORAGE.isInitialized();
        $scope.profiles = CHROMESTORAGE.getAvailableProfiles();//["DEFAULT", "Profile-1", "Profile-2"];

        /*
         * If user is not logged in redirect to "noprofile" state
         */
        if(!$scope.logged_in && !$state.is("noprofile")) {
            $state.go("noprofile");
        }


});