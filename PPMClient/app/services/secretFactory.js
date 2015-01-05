define([
    'angular',
    'bluebird',
    'underscore'
], function (angular, Promise, _) {
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
                return new Promise(function (fulfill, reject) {
                    /**
                     * @param {Passcard} secretObject
                     */
                    var secretObject = SERVERCONCENTRATOR.getSecret(id);
                    if(!secretObject) {
                        return reject(new Error("Secret not found!"));
                    }
                    var secretData = _.clone(secretObject.get("data"));
                    secretObject.getSecret().then(function(secretSecret) {
                        secretData = _.extend(secretData, secretSecret);
                        fulfill(secretData);
                    }).catch(function (e) {
                        return reject(e);
                    });
                });
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
