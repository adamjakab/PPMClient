define([
    'angular', 'underscore'
], function (angular, _) {
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
                log("EDIT PASSCARD: " + id);
                var modalInstance = $modal.open({
                    templateUrl: 'options/states/passcard/passcard.edit.html',
                    controller: 'passcard.edit.controller',
                    size: 'lg',
                    backdrop: 'static',
                    backdropClass: 'modalBackdrop',
                    resolve: {
                        id: function () {
                            return id;
                        }
                    }
                });

                modalInstance.result.then(function(modifiedItem) {
                    //MODAL CLOSE)save)
                    secretFactory.updateSecret(modifiedItem);
                }, function() {
                    //MODAL DISMISS(cancel)
                    //refreshSecrets();//not needed
                });
            };

            $scope.createItem = function() {
                var id = secretFactory.createSecret();
                log("CREATE NEW PASSCARD: " + id);
                $scope.editItem(id);
            };

            /**
             * @param {String} id
             * @param {String} name
             */
            $scope.deleteItem = function(id, name) {
                var modalInstance = $modal.open({
                    templateUrl: 'options/states/passcard/passcard.delete.html',
                    controller: 'passcard.delete.controller',
                    //size: 'lg',
                    backdrop: 'static',
                    backdropClass: 'modalBackdrop',
                    resolve: {
                        data: function () {
                            return { id: id, name: name };
                        }
                    }
                });
                modalInstance.result.then(function() {
                    //MODAL CLOSE)save)
                    secretFactory.deleteSecret(id, true);
                    refreshSecrets();
                }, function() {
                    //MODAL DISMISS(cancel)
                });
            };

            /**
             * PPM CustomEvent Listener - listens to events dispatched in background
             * @param {*} e
             */
            var customEventListener = function(e) {
                if(e && _.isObject(e.detail)) {
                    var eventData = e.detail;
                    switch (eventData.type) {
                        case "passcard_change":
                            refreshSecrets();
                            break;
                    }
                }
            };

            /**
             * Refreshes secrets on $scope
             */
            var refreshSecrets = function() {
                _.defer(function() {
                    $scope.$apply(function() {
                        $scope.secrets = secretFactory.getSecrets();
                    });
                });
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
    angular.module('optionsApp').controller('passcard.edit.controller', [
            '$scope', '$modalInstance', 'secretFactory', 'id',
            function ($scope, $modalInstance, secretFactory, id) {
                var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
                var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
                var UTILS = PPM.getComponent("UTILS");

                $scope.item = null;
                $scope.lockUsername = true;
                $scope.lockPassword = true;
                $scope.showPassword = false;

                secretFactory.getSecret(id).then(function(item) {
                    _.defer(function() {
                        $scope.$apply(function() {
                            $scope.item = item;
                            $scope.lockUsername = !_.isEmpty($scope.item.username);
                            $scope.lockPassword = !_.isEmpty($scope.item.password);
                            //new passcards are created with name:"_new_passcard_" - let's clean this
                            $scope.item.name = ($scope.item.name=="_new_passcard_" ? "" : $scope.item.name);
                        });
                    });
                }).catch(function (e) {
                    $scope.cancel();
                });

                $scope.toggleUsernameLock = function() {
                    $scope.lockUsername = !$scope.lockUsername;
                };

                $scope.togglePasswordLock = function() {
                    $scope.lockPassword = !$scope.lockPassword;
                };

                $scope.togglePasswordVisibility = function() {
                    $scope.showPassword = !$scope.showPassword;
                };

                $scope.generatePassword = function() {
                    if(!$scope.lockPassword) {
                        var SyncConfig = CHROMESTORAGE.getConfigByLocation("sync");
                        var length = SyncConfig.get("pwgen.length");
                        var options = SyncConfig.get("pwgen.options");
                        $scope.item.password = UTILS.getGibberish(length, length, options);
                    } else {
                        //
                    }
                };

                $scope.save = function () {
                    $modalInstance.close($scope.item);
                };

                $scope.cancel = function () {
                    //will check if secret in a newly created secret(unsaved) and will remove it from secretStorage
                    secretFactory.deleteSecret($scope.item._id);
                    $modalInstance.dismiss('cancel');
                };

            }
        ]
    );

    /**
     * Passcard Delete Modal Controller
     */
    angular.module('optionsApp').controller('passcard.delete.controller', [
            '$scope', '$modalInstance', 'data',
            function ($scope, $modalInstance, data) {
                $scope.data = data;

                $scope.remove = function () {
                    $modalInstance.close();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

            }
        ]
    );

});