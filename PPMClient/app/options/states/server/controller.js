define([
    'angular'
], function () {
    angular.module('optionsApp').controller('server.controller',
        function ($scope, settings, $state, $interval, serverFactory) {
            $scope.settings = settings;
            var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
            var SERVERCONCENTRATOR = PPM.getComponent("SERVERCONCENTRATOR");
            //var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
            //var UTILS = PPM.getComponent("UTILS");
            /** log shorthand */
            var log = function (msg, type) {
                PPM.getComponent("LOGGER").log(msg, "OPTIONS(server)", type);
            };

            /**
             * Check access
             * If user is not logged in redirect to "noprofile" state
             */
            $scope.logged_in = PPM.isLoggedIn();
            if (!$scope.logged_in) {
                $state.go("noprofile");
            }

            $scope.servers = serverFactory.getServers();

            $scope.connectServer = function(index) {
                SERVERCONCENTRATOR.connectServer(index).then(function() {
                    log("CONNECTION OK!");
                }).catch(function(e) {
                    log("CONNECTION FAILED! "+ e.message);
                });
            };

            $scope.disconnectServer = function(index) {
                SERVERCONCENTRATOR.disconnectServer(index).then(function() {
                    log("DISCONNECTION OK!");
                }).catch(function(e) {
                    log("DISCONNECTION FAILED! "+ e.message);
                });
            };

            /**
             * PPM CustomEvent Listener - listens to events dispatched in background
             */
            var customEventListener = function(e) {
                if(e && _.isObject(e.detail)) {
                    var eventData = e.detail;
                    switch (eventData.type) {
                        case "server_state_change":
                        case "server_xchange":
                            $scope.$apply(function() {
                                $scope.servers = serverFactory.getServers();
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
