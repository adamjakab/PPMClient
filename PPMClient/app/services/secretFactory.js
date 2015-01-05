define([
    'angular',
    'underscore'
], function (angular, _) {
    angular.module('optionsApp').factory('secretFactory', function() {
        var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
        var SERVERCONCENTRATOR = PPM.getComponent("SERVERCONCENTRATOR");

        return {
            getSecrets: function() {
                var secrets = {};
                var secretStorage = SERVERCONCENTRATOR.getSecrets();

                _.each(secretStorage,
                    /**
                     * @param {Passcard} secretObject
                     */
                    function(secretObject) {
                        var secretData = _.clone(secretObject.get("data"));
                        secretData.sync_state = secretObject.get("sync_state");
                        secrets[secretData._id] = secretData;
                    }
                );
                return secrets;
            },
            getSecret: function(id) {
                /**
                 * @param {Passcard} secretObject
                 */
                var secretObject = SERVERCONCENTRATOR.getSecret(id);
                return _.clone(secretObject.get("data"));
            },
            updateSecret: function(data) {
                /**
                 * @param {Passcard} secretObject
                 */
                var secretObject = SERVERCONCENTRATOR.getSecret(data._id);
                if(secretObject) {
                    secretObject.set("data", data);
                }
            }
        };
    });
});
