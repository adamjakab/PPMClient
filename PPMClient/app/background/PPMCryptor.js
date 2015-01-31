/**
 * Crypt/Decrypt methods
 */
define([
    'PPMLogger',
    'PPMUtils',
    'ChromeStorage',
    'CryptoModule',
    'underscore',
    'bluebird'
], function (PPMLogger, PPMUtils, ChromeStorage, CryptoModule, _, Promise) {
    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function(msg, type) {PPMLogger.log(msg, "CRYPTOR", type);};

    /**
     * The Iframe where the encryption schemes are registered in the background page
     */
    var encryptionSchemesSandbox = document.getElementById('encryptionSchemesSandbox');

    /**
     * We store messages here indexed by messageId containing the fulfill/reject for returned Promises
     * @type {{}}
     */
    var messageQueue = {};

    /**
     * Message Queue Cleanup Service Interval
     * @type {number}
     */
    var MQCSI = null;

    /**
     * Encrypt text with encryptionScheme
     * @param {String} passcardPayloadText
     * @param {String} passcardId
     * @param {String} encryptionScheme
     * @param {String} encryptionKey
     * @return {Promise}
     */
    var encryptPayload = function(passcardPayloadText, passcardId, encryptionScheme, encryptionKey) {
        return new Promise(function (fulfill, reject) {
            sendMessageToSandbox({
                domain: 'encryptionSchemes',
                command: 'encryptPayload',
                passcardPayloadText: passcardPayloadText,
                encryptionKey: encryptionKey,
                passcardId: passcardId,
                encryptionScheme: encryptionScheme
            }).then(function (response) {
                if(response["response"]["error"] === false) {
                    fulfill(response["response"]["message"]);
                } else {
                    log("Payload("+encryptionScheme+") decryption failed! " + response["response"]["message"]);
                    return reject(new Error(response["response"]["message"]));
                }
            }).catch(function (e) {
                return reject(new Error("Payload("+encryptionScheme+") Encryption error: " + e));
            });
        });
    };

    /**
     * Decrypt text with encryptionScheme
     * @param {String} passcardPayloadText
     * @param {String} passcardId
     * @param {String} encryptionScheme
     * @param {String} encryptionKey
     * @return {Promise}
     */
    var decryptPayload = function(passcardPayloadText, passcardId, encryptionScheme, encryptionKey) {
        return new Promise(function (fulfill, reject) {
            sendMessageToSandbox({
                domain: 'encryptionSchemes',
                command: 'decryptPayload',
                passcardPayloadText: passcardPayloadText,
                encryptionKey: encryptionKey,
                passcardId: passcardId,
                encryptionScheme: encryptionScheme
            }).then(function (response) {
                if(response["response"]["error"] === false) {
                    fulfill(response["response"]["message"]);
                } else {
                    log("Payload("+encryptionScheme+") decryption failed! " + response["response"]["message"]);
                    return reject(new Error(response["response"]["message"]));
                }
            }).catch(function (e) {
                return reject(new Error("Payload("+encryptionScheme+") decryption error: " + e));
            });
        });
    };

    /**
     * PPM CustomEvent Listener - main event listener
     * DISPATCH CUSTOM EVENT LIKE THIS: PPMUtils.dispatchCustomEvent({type:"logged_in", ...});
     */
    var customEventListener = function(e) {
        if(e && _.isObject(e.detail)) {
            var eventData = e.detail;
            switch (eventData.type) {
                case "logged_in":
                    registerEncryptionSchemes();
                    break;
            }
        }
    };

    /**
     * @param event
     */
    var listenToSandboxEvents = function(event) {
        if(!_.isUndefined(event.data)
            && !_.isUndefined(event.data.messageId)
            && _.contains(_.keys(messageQueue), event.data.messageId)
        ) {
            var MQI = messageQueue[event.data.messageId];
            var fulfill = MQI["fulfill"];
            fulfill(event.data);
            delete messageQueue[event.data.messageId];
        }
    };

    /**
     * Sends a message to the sandbox with messageId so when listener replies and returns same messageID
     * we will know to what message the reply corresponds to. It will also pack the fulfill/reject for the returned
     * Promise which will be used by the listener to notify that the response has come back
     * @param {object} data
     * @return {Promise}
     */
    var sendMessageToSandbox = function(data) {
        return new Promise(function (fulfill, reject) {
            var messageId = PPMUtils.get_uuid_v4();
            messageQueue[messageId] = {
                timestamp: PPMUtils.getTimestamp(),
                fulfill: fulfill,
                reject: reject
            };
            data["messageId"] = messageId;
            encryptionSchemesSandbox.contentWindow.postMessage(data, "*");
        });
    };

    /**
     * Register Encryption Schemes in Sandbox
     * This method is called twice:
     *  1) on initialize when we are registering default ESs
     *  2) after login when we might have additional ESs
     * @return {Promise}
     */
    var registerEncryptionSchemes = function() {
        return new Promise(function (fulfill, reject) {
            var registeredEncryptionSchemes = [];
            sendMessageToSandbox({
                domain: 'encryptionSchemes',
                command: 'getRegisteredSchemeNames'
            }).then(function (response) {
                registeredEncryptionSchemes = response["response"]["message"];
                var syncConfig = ChromeStorage.getConfigByLocation("sync");
                var schemes = syncConfig.get("cryptor.schemes");
                //log("SCHEMES: " + JSON.stringify(schemes));
                var registrationData = {
                    domain: 'encryptionSchemes',
                    command: 'registerEncryptionScheme'
                };

                var registrationPromises = [];
                _.each(schemes, function (schemeData, schemeName) {
                    if(!_.contains(registeredEncryptionSchemes, schemeName)) {
                        schemeData["schemeName"] = schemeName;
                        schemeData = _.extend(registrationData, schemeData);
                        registrationPromises.push(sendMessageToSandbox(schemeData));
                    }
                });

                if(!_.isEmpty(registrationPromises)) {
                    Promise.settle(registrationPromises).then(function () {
                        sendMessageToSandbox({
                            domain: 'encryptionSchemes',
                            command: 'getRegisteredSchemeNames'
                        }).then(function (response) {
                            registeredEncryptionSchemes = response["response"]["message"];
                            log("Registered Encryption Schemes: " + JSON.stringify(registeredEncryptionSchemes));
                            fulfill();
                        }).catch(function (e) {
                            return reject(new Error("Cannot retrieve registered encryption schemes: " + e));
                        });
                    });
                } else {
                    fulfill();
                }
            }).catch(function (e) {
                return reject(new Error("Cannot retrieve registered encryption schemes: " + e));
            });
        });
    };

    var unregisterAllEncryptionSchemes = function() {
        return new Promise(function (fulfill, reject) {
            sendMessageToSandbox({
                domain: 'encryptionSchemes',
                command: 'unregisterAllEncryptionSchemes'
            }).then(function (response) {
                log(response["response"]["message"]);
                fulfill();
            }).catch(function (e) {
                return reject(new Error("Encryption Scheme unregistration error: " + e));
            });
        });
    };

    /**
     * CLeans up message queue from stale messages by rejecting them
     * @private
     */
    var _cleanUpMessageQueue = function() {
        var msgTimeoutSecs = 5;
        _.each(messageQueue, function(MQI, messageId) {
            var ts = PPMUtils.getTimestamp();
            if(MQI["timestamp"] + msgTimeoutSecs < ts) {
                var reject = MQI["reject"];
                reject(new Error("No answer from sandbox for message("+messageId+")!"));
                delete messageQueue[messageId];
            }
        });
    };

    var _messageQueueCleanupServiceStart = function() {
        if(_.isNull(MQCSI)) {
            log("Starting Message Queue Cleanup Service");
            MQCSI = setInterval(_cleanUpMessageQueue, 5000);
        }
    };

    var _messageQueueCleanupServiceStop = function() {
        log("Stopping Message Queue Cleanup Service");
        clearInterval(MQCSI);
        MQCSI = null;
    };

    return {
        /**
         * Initialize component
         * @returns {Promise}
         */
        initialize: function() {
            return new Promise(function (fulfill, reject) {
                window.addEventListener('message', listenToSandboxEvents);
                document.addEventListener("PPM", customEventListener, false);
                _messageQueueCleanupServiceStart();
                registerEncryptionSchemes().then(function() {
                    log("INITIALIZED", "info");
                    fulfill();
                }).catch(function (e) {
                    return reject(e);
                });
            });
        },

        /**
         * Shut down component
         * @returns {Promise}
         */
        shutdown: function() {
            return new Promise(function (fulfill, reject) {
                unregisterAllEncryptionSchemes().then(function() {
                    document.removeEventListener("PPM", customEventListener, false);
                    window.removeEventListener('message', listenToSandboxEvents);
                    _messageQueueCleanupServiceStop();
                    log("SHUTDOWN COMPLETED", "info");
                    fulfill();
                }).catch(function (e) {
                    return reject(e);
                });
            });
        },

        encryptPayload: encryptPayload,
        decryptPayload: decryptPayload
    };
});
