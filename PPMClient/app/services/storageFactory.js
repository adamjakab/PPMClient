define([
    'angular',
    'underscore'
], function (angular, _) {
    angular.module('App').factory('storageFactory', function() {
        var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
        var ChromeStorage = PPM.getComponent("CHROMESTORAGE");

        return {
            /**
             * Get list of profiles
             * @return {{}}
             */
            getProfiles: function() {
                var profiles = {};
                var profileNames = ChromeStorage.getAvailableProfiles();
                var currentProfile = ChromeStorage.getCurrentProfile();
                _.each(profileNames, function(profileName) {
                    var profile = {
                        name: profileName,
                        active: (profileName === currentProfile)
                    };
                    profiles[profileName] = profile;
                });
                return profiles;
            },

            /**
             *
             * @param {string} profileName
             */
            getProfile: function(profileName) {
                if(!ChromeStorage.hasProfile(profileName)) {
                    //throw new Error("No profile by this name["+profileName+"]!");
                    return {
                        name: "",
                        active: false,
                        encryptionScheme: "AesMd5",
                        encryptionKey: ""
                    };
                }

                let currentProfile = ChromeStorage.getCurrentProfile();
                return {
                    name: profileName,
                    active: (profileName === currentProfile),
                    encryptionScheme: ChromeStorage.getCurrentEncryptionScheme(),
                    encryptionKey: ChromeStorage.getCurrentEncryptionKey()
                };
            }

        };
    });
});
