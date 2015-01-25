define([
    'angular',
    'bluebird',
    'underscore'
], function (angular, Promise, _) {
    angular.module('optionsApp').factory('secretFactory', function() {
        var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
        var SERVERCONCENTRATOR = PPM.getComponent("SERVERCONCENTRATOR");

        return {
            /**
             * Will return all secrets in state(sync_state):
             *      0(in sync) - YES
             *      1(out of sync) - YES
             *      2(deleted) waiting to be deleted - NO
             *      3(new) newly created not yet persisted - NO
             * @return {{}}
             */
            getSecrets: function() {
                var secrets = [];
                var secretStorage = SERVERCONCENTRATOR.getSecrets();

                _.each(secretStorage,
                    /**
                     * @param {Passcard} secretObject
                     */
                    function(secretObject) {
                        var sync_state = secretObject.get("sync_state");
                        if(_.contains([0,1], sync_state)) {
                            var secretData = _.clone(secretObject.get("data"));
                            secretData.sync_state = sync_state;
                            secrets.push(secretData);
                        }
                    }
                );
                return secrets;
            },

            /**
             * Returns secret complete with secret payload
             * @param id
             * @return {Promise}
             */
            getSecret: function(id) {
                return new Promise(function (fulfill, reject) {
                    //console.log("Getting secret: " + id);
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
                    SERVERCONCENTRATOR.saveSecret(data._id);
                }
            },

            /**
             * Creates and registers a new passcard in secretStorage with sync_state=3(new)
             *
             * @return {String} - id of the new secret
             */
            createSecret: function() {
                return SERVERCONCENTRATOR.createSecret();
            },

            /**
             * Deletes a specific secret
             * if new(sync_state=3) it will be simply removed from secretStorage
             * otherwise it will be marked for remote storage deletion(sync_state=2)
             *
             * @param {String} id
             * @param {Boolean} [force] - set true to delete secret in any state
             */
            deleteSecret: function(id, force) {
                var secretObject = SERVERCONCENTRATOR.getSecret(id);
                if(secretObject) {
                    if(secretObject.get("sync_state")==3 || force === true) {
                        SERVERCONCENTRATOR.deleteSecret(id);
                    }
                }
            }

        };
    });
});
