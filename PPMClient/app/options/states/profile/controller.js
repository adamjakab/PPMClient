define([
    'angular'
], function () {
    angular.module('App').controller('profile.controller',
        function ($scope, settings, $state, profileFactory, $modal) {
            $scope.settings = settings;
            var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
            /** log shorthand */
            var log = function (msg, type) {
                PPM.getComponent("LOGGER").log(msg, "OPTIONS(profile)", type);
            };

            $scope.profiles = profileFactory.getProfiles();

            /**
             * @param {string} name
             */
            $scope.editProfile = function(name) {
                log("EDIT PROFILE: " + name);
                var modalInstance = $modal.open({
                    templateUrl: 'options/states/profile/profile.edit.html',
                    controller: 'profile.edit.controller',
                    size: 'lg',
                    backdrop: 'static',
                    backdropClass: 'modalBackdrop',
                    resolve: {
                        name: function () {
                            return name;
                        }
                    }
                });

                modalInstance.result.then(function(modifiedItem) {
                    //MODAL CLOSE(save)
                    //secretFactory.updateSecret(modifiedItem);
                    log("closed");
                }, function() {
                    //MODAL DISMISS(cancel)
                    log("cancelled")
                });
            };

        }
    );

    /**
     * Profile Edit Modal Controller
     */
    angular.module('App').controller('profile.edit.controller', [
            '$scope', '$modalInstance', 'profileFactory', 'name',
            function ($scope, $modalInstance, profileFactory, name) {
                var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
                var ChromeStorage = PPM.getComponent("CHROMESTORAGE");
                var PPMUtils = PPM.getComponent("UTILS");

                $scope.item = null;
                $scope.lockUsername = true;
                $scope.lockPassword = true;
                $scope.showPassword = false;
                $scope.noItemMessage = "Fetching profile...";

                $scope.item = {
                    name: "PALO"
                };

                $scope.save = function () {
                    $modalInstance.close($scope.item);
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

            }
        ]
    );
});