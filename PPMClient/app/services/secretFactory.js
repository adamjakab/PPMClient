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
                        secrets[secretObject.get("id")] = secretObject.get("all");
                    }
                );
                return secrets;
            },
            getSecret: function(id) {
                var secret = {};
                /**
                 * @param {Passcard} secretObject
                 */
                var secretObject = SERVERCONCENTRATOR.getSecret(id);
                var secretData = {};
                var props = ["id", "name", "identifier", "username", "password"];
                _.each(props, function(prop) {
                    secretData[prop] = secretObject.get(prop);
                });
                secret = secretData;

                return secret;
            },
            updateSecret: function(data) {
                /**
                 * @param {Passcard} secretObject
                 */
                var secretObject = SERVERCONCENTRATOR.getSecret(data.id);
                secretObject.set("all", data);

            }
        };
    });
});
