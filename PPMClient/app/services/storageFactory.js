define([
    'angular',
    'underscore'
], function (angular, _) {
    angular.module('App').factory('storageFactory', function() {
        var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
        var ChromeStorage = PPM.getComponent("CHROMESTORAGE");

        return {
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
            }
        };
    });
});
