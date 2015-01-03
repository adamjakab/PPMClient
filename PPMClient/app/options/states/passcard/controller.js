define([
    'angular'
], function () {
    angular.module('optionsApp').controller('passcard.controller',
        function ($scope, settings, $state, $interval, secretFactory, $modal) {
            $scope.settings = settings;
            var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
            var SERVERCONCENTRATOR = PPM.getComponent("SERVERCONCENTRATOR");
            //var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
            //var UTILS = PPM.getComponent("UTILS");
            /** log shorthand */
            var log = function (msg, type) {
                PPM.getComponent("LOGGER").log(msg, "OPTIONS(passcard)", type);
            };

            /**
             * Check access
             * If user is not logged in redirect to "noprofile" state
             */
            $scope.logged_in = PPM.isLoggedIn();
            if (!$scope.logged_in) {
                $state.go("noprofile");
            }

            $scope.secrets = secretFactory.getSecrets();

            /**
             * @param {*} id
             */
            $scope.editItem = function(id) {
                log("EDIT: " + id);
                var modalInstance = $modal.open({
                    templateUrl: 'options/states/passcard/passcard.edit.html',
                    controller: 'passcard.edit.controller',
                    backdrop: 'static',
                    backdropClass: 'modalBackdrop',
                    resolve: {
                        item: function () {
                            return secretFactory.getSecret(id);
                        }
                    }
                });

                modalInstance.result.then(function (modifiedItem) {
                    secretFactory.updateSecret(modifiedItem);
                }, function () {
                    log('Modal dismissed at: ' + new Date());
                });
            };

            /**
             * @param {*} id
             */
            $scope.deleteItem = function(id) {
                log("DELETE: " + id);
            };

            /**
             * PPM CustomEvent Listener - listens to events dispatched in background
             */
            var customEventListener = function(e) {
                if(e && _.isObject(e.detail)) {
                    var eventData = e.detail;
                    switch (eventData.type) {
                        case "passcard_change":
                            $scope.$apply(function() {
                                $scope.secrets = secretFactory.getSecrets();
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

    /**
     * Passcard Edit Modal Controller
     */
    angular.module('optionsApp').controller('passcard.edit.controller',
        function ($scope, $modalInstance, item) {
            var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
            /** log shorthand */
            var log = function (msg, type) {
                PPM.getComponent("LOGGER").log(msg, "OPTIONS(passcard_edit)", type);
            };
            $scope.item = item;

            $scope.save = function () {
                $modalInstance.close($scope.item);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

        }
    );
});