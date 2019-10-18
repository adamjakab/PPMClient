define([
    'angular'
], function () {
    angular.module('App').controller('profile.controller',
        function ($scope, settings, $state, storageFactory, $uibModal) {
            $scope.settings = settings;

            let PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
            let ChromeStorage = PPM.getComponent("CHROMESTORAGE");

            /** log shorthand */
            let log = function (msg, type) {
                PPM.getComponent("LOGGER").log(msg, "OPTIONS(profile)", type);
            };

            $scope.profiles = storageFactory.getProfiles();

            /**
             * @param {string|null} name
             */
            $scope.editProfile = function (name) {
                log("EDIT PROFILE: " + name);
                let modalInstance = $uibModal.open({
                    templateUrl: 'options/states/profile/profile.edit.html',
                    controller: 'profile.edit.controller',
                    size: 'lg',
                    backdrop: 'static',
                    backdropClass: 'modalBackdrop',
                    windowClass: 'show',
                    animation: true,
                    resolve: {
                        name: function () {
                            return name;
                        }
                    }
                });

                modalInstance.result.then(function (modifiedItem) {
                    //MODAL CLOSE(save)
                    log("closed");
                }, function () {
                    //MODAL DISMISS(cancel)
                    log("cancelled")
                });
            };

            /**
             * @param {string} name
             */
            $scope.deleteProfile = function (name) {
                if (confirm("Are you sure you want to remove the profile named: " + name + "?")) {
                    ChromeStorage.removeProfile(name).then(function () {
                        _.defer(function () {
                            $scope.$apply(function () {
                                $scope.profiles = storageFactory.getProfiles();
                            });
                        });
                    }).catch(
                        function (e) {
                            alert(e);
                        }
                    );
                }
            };
        }
    );

    /**
     * Profile Edit Modal Controller (https://angular-ui.github.io/bootstrap/#!#modal)
     */
    angular.module('App').controller('profile.edit.controller', [
            '$scope', '$uibModalInstance', 'storageFactory', 'cryptorFactory', 'name',
            function ($scope, $uibModalInstance, storageFactory, cryptorFactory, name) {
                let PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
                let ChromeStorage = PPM.getComponent("CHROMESTORAGE");
                let PPMUtils = PPM.getComponent("UTILS");

                /** log shorthand */
                let log = function (msg, type) {
                    PPM.getComponent("LOGGER").log(msg, "OPTIONS(profile)", type);
                };

                let profileNames = ChromeStorage.getAvailableProfiles();

                $scope.showPassword = false;
                $scope.noItemMessage = "Fetching profile...";

                $scope.currentProfileName = name;
                $scope.item = storageFactory.getProfile(name);
                $scope.schemes = cryptorFactory.getEncryptionSchemes();


                $scope.togglePasswordVisibility = function() {
                    $scope.showPassword = !$scope.showPassword;
                };

                $scope.save = function () {
                    let unmodifiedItem = storageFactory.getProfile(name);
                    if(_.isEqual($scope.item, unmodifiedItem)) {
                        $modalInstance.dismiss('cancel');
                        return;
                    }
                    //check that user has not set the name of another existing profile
                    if($scope.item.name != name && _.contains(profileNames, $scope.item.name)) {
                        alert("There is already a profile by this name!");
                        return;
                    }

                    $scope.modifiedItem = _.clone($scope.item);
                    $scope.noItemMessage = "Warning! "
                        + "It is absolutely crucial that no other computers are logged into this profile before proceeding! "
                        + "After your changes have been persisted you will be logged out and you will be able to log back in with your new credentials.";
                    $scope.item = null;
                };

                $scope.updateProfile = function() {
                    ChromeStorage.updateProfile(
                        name,
                        $scope.modifiedItem.name,
                        $scope.modifiedItem.encryptionScheme,
                        $scope.modifiedItem.encryptionKey
                    ).then(
                        function() {
                            PPM.logout().then(function () {
                                log("LOGOUT OK");
                                PPM.initialize().then(function() {
                                    PPMUtils.closeOptionsPage().then(function () {
                                        //
                                    });
                                });
                            }).catch(Error, function () {
                                log("LOGOUT FAILED!");
                            });
                        }
                    ).catch(
                        function (e) {
                            alert(e);
                            $uibModalInstance.dismiss('cancel');
                        }
                    );
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };

            }
        ]
    );
});