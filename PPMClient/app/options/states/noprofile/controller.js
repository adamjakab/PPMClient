define([
    'angular'
], function () {
    angular.module('App').controller('noprofile.controller',
        function ($scope, settings, $state) {
            $scope.settings = settings;
            var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;

            /**
             * Check access
             * If user is logged in redirect to "info" state
             */
            $scope.logged_in = PPM.isLoggedIn();
            if ($scope.logged_in) {
                $state.go("info");
            }
        }
    );
});