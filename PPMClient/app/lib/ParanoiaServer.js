/**
 * Paranoia Server implementation
 */
define([
        'PPMLogger',
        'PPMUtils',
        'PPMCryptor',
        'CryptoModule',
        'bluebird',
        'underscore'
    ],
    function(PPMLogger, PPMUtils, PPMCryptor, CryptoModule, Promise, _) {
        /**
         *
         * @param {ConfigurationManager} srvCfg
         * @constructor
         */
        function ParanoiaServer(srvCfg) {
            /* @todo: Some of this stuff should be configurable */
            var serverConfig = new ConfigurationManager({
                /* STATE */
                connected: false,
                busy: false,
                /* RECONNECTION AND TIMESTAMPS*/
                reconnect_after_secs: 30, //if server disconnects after this number of seconds server will try to reconnect
                connection_ts: 0, //time since server is connected
                disconnection_ts: 0, //time since server is disconnected
                last_ping_ts: 0, //last time server was contacted
                ping_interval: 10, //seconds
                /* SEED AND DATA PADDING */
                seed_length_min: 24,
                seed_length_max: 32,
                padding_length_min: 48,
                padding_length_max: 64,
                /**/
                seed: null,
                timestamp: null,
                leftPadLength: null,
                rightPadLength: null,
                /**/
                KASIREF: null,//KeepAliveService Interval Reference
                KASEI: 5 * 1000 //KeepAliveService Execution Interval(ms)
            });
            serverConfig.merge(srvCfg.getAll());

            /**
             * Log facility
             * @param msg
             * @param type
             */
            var log = function(msg, type) {PPMLogger.log(msg, "PPMServer["+serverConfig.get("index")+"]", type);};

            /**
             * @type {XMLHttpRequest}
             */
            var xhr;

            /**
             * Hold fulfill/reject Promise pairs for operations which cannot be executed right away because
             * server is busy
             * @type {Array}
             */
            var operationQueue = [];

            /**
             * Initialize server
             */
            var init =function() {
                log("Server was initialized: " + JSON.stringify(serverConfig.getAll()));
                _setupXHR();
            };

            /**
             * @return {{connected: *, busy: *, seed: *, timestamp: *, leftPadLength: *, rightPadLength: *}}
             */
            this.getServerState = function() {
                return {
                    connected: serverConfig.get("connected", false),
                    busy: serverConfig.get("busy", false),
                    queue_length: operationQueue.length,
                    seed: serverConfig.get("seed", false),
                    timestamp: serverConfig.get("timestamp", false),
                    leftPadLength: serverConfig.get("leftPadLength", false),
                    rightPadLength: serverConfig.get("rightPadLength", false),
                    connection_ts: serverConfig.get("connection_ts", false),
                    disconnection_ts: serverConfig.get("disconnection_ts", false)
                };
            };

            //-------------------------------------------------------------------------------------------------- CONNECT
            /**
             * Connects the server
             * //@todo: on login server should send configuration/version information from which we should extract the
             * session timeout so we know how often to ping and other stuff(like version check)
             * @return {Promise}
             */
            var _connect = function() {
                return new Promise(function (fulfill, reject) {
                    if(_isConnected()) {
                        return reject(new Error("Server is already connected"));
                    }
                    _keepAliveServiceStart();
                    _communicateWithServer({service: "login"}).then(function() {
                        serverConfig.set("connected", true);
                        serverConfig.set("connection_ts", _getTimestamp());
                        PPMUtils.dispatchCustomEvent({type: 'server_state_change', index: serverConfig.get("index")});
                        log("connected");
                        fulfill();
                    }).catch(function(e) {
                        return reject(e);
                    });
                });
            };
            this.connect = _connect;

            //----------------------------------------------------------------------------------------------- DISCONNECT
            /**
             * Disonnects the server
             * @return {Promise}
             */
            var _disconnect = function() {
                return new Promise(function (fulfill, reject) {
                    if(!_isConnected()) {
                        return reject(new Error("Server is already disconnected"));
                    }
                    _keepAliveServiceStop();
                    _communicateWithServer({service: "logout"}).then(function() {
                        serverConfig.set("connected", false);
                        _putServerInDisconnectedState();
                        PPMUtils.dispatchCustomEvent({type: 'server_state_change', index: serverConfig.get("index")});
                        log("disconnected");
                        fulfill();
                    }).catch(function(e) {
                        return reject(e);
                    });
                });
            };
            this.disconnect = _disconnect;

            //------------------------------------------------------------------------------------------------------PING
            var _ping = function() {
                _communicateWithServer({service: "ping"}).then(function(SCO) {
                    log("pinged("+SCO.responseObject.msg+")");
                }).catch(function(e) {
                    log(e, "error");
                });
            };

            //------------------------------------------------------------------------------------------------LOAD INDEX
            /**
             * Loads index data
             * @return {Promise}
             */
            this.loadIndex = function() {
                return new Promise(function (fulfill, reject) {
                    _communicateWithServer({
                        service: "db",
                        operation: {
                            name: "get_index",
                            params: {
                                collection: null /*load all collection types*/
                            }
                        }
                    }).then(function (SCO) {
                       // log("loaded index(" + JSON.stringify(SCO.responseObject) + ")");
                        if(_.isUndefined(SCO.responseObject.data)) {
                            return reject(new Error("Server did not return data object!"));
                        }
                        fulfill(SCO.responseObject.data);
                    }).catch(function (e) {
                        return reject(e);
                    });
                });
            };

            //-----------------------------------------------------------------------------------------------LOAD SECRET
            /**
             * Loads payload for passcard and decrypts it to whatever it was before encryption
             * @param {String} id
             * @return {Promise}
             */
            this.loadSecret = function(id) {
                return new Promise(function (fulfill, reject) {
                    if(_.isUndefined(id) || _.isEmpty(id)) {
                        return reject(new Error("Undefined Id!"));
                    }
                    _communicateWithServer({
                        service: "db",
                        operation: {
                            name: "get_secure",
                            params: {
                                _id: id
                            }
                        }
                    }).then(function (SCO) {
                        if(_.isUndefined(SCO.responseObject.data) || _.isEmpty(SCO.responseObject.data)) {
                            return reject(new Error("Server did not return payload!"));
                        }
                        PPMCryptor.decryptPayload(SCO.responseObject.data,
                            id,
                            serverConfig.get("encryption_scheme"),
                            serverConfig.get("master_key")
                        ).then(function(decryptedPayload) {
                                var decryptedPayloadObject = PPMUtils.objectizeJsonString(decryptedPayload);
                                if(decryptedPayloadObject===false) {
                                    return reject(new Error("Unable to decrypt payload!"));
                                }
                                fulfill(decryptedPayloadObject);
                            }
                        ).catch(function (e) {
                                return reject(e);
                            }
                        );
                    }).catch(function (e) {
                        return reject(e);
                    });
                });
            };

            //-----------------------------------------------------------------------------------------------SAVE SECRET
            /**
             * Saves data object - whatever is in payload inside object needs to be encrypted before saving
             * @param {Object} data
             * @return {Promise}
             */
            this.saveSecret = function(data) {
                return new Promise(function (fulfill, reject) {
                    var doSave = function() {
                        _communicateWithServer({
                            service: "db",
                            operation: {
                                name: "save",
                                params: {
                                    itemdata: data
                                }
                            }
                        }).then(function () {
                            fulfill(data._id);
                        }).catch(function (e) {
                            return reject(e);
                        });
                    };

                    if(!_.isUndefined(data["payload"])) {
                        if(_.isObject(data["payload"])) {
                            var unencryptedPayload = JSON.stringify(data["payload"]);
                            PPMCryptor.encryptPayload(unencryptedPayload,
                                data["_id"],
                                serverConfig.get("encryption_scheme"),
                                serverConfig.get("master_key")
                            ).then(function(encryptedPayload) {
                                    data["payload"] = encryptedPayload;
                                    doSave();
                                }
                            ).catch(function (e) {
                                    return reject(e);
                                }
                            );
                        } else {
                            delete data["payload"];
                            doSave();
                        }
                    } else {
                        doSave();
                    }
                });
            };

            //---------------------------------------------------------------------------------------------DELETE SECRET
            /**
             * Deletes data object
             * @param {String} id
             * @return {Promise}
             */
            this.deleteSecret = function(id) {
                return new Promise(function (fulfill, reject) {
                    _communicateWithServer({
                        service: "db",
                        operation: {
                            name: "delete",
                            params: {
                                _id: id
                            }
                        }
                    }).then(function () {
                        fulfill(id);
                    }).catch(function (e) {
                        return reject(e);
                    });
                });
            };

            //-----------------------------------------------------------------------------------KEEP-ALIVE SERVICE(KAS)
            var _keepAliveServiceStart = function() {
                if(_.isNull(serverConfig.get("KASIREF"))) {
                    log("Starting Keep Alive Service");
                    var KASIREF = setInterval(_keepAliveServiceMainThread, serverConfig.get("KASEI"));
                    serverConfig.set("KASIREF", KASIREF);
                }
            };

            var _keepAliveServiceStop = function() {
                log("Stopping Keep Alive Service");
                var KASIREF = serverConfig.get("KASIREF");
                clearInterval(KASIREF);
                serverConfig.set("KASIREF", null);
            };

            var _keepAliveServiceMainThread = function() {
                //log("KAS...");

                //#1 - CHECK IF CONNECTED AND RECONNECT AUTOMATICALLY IF NOT
                if (serverConfig.get("connected") !== true){
                    //WE ARE DISCONNECTED - LET'S WAIT UNTIL "reconnect_after_secs" passes and then lets try to reconnect
                    var connect_in_secs = serverConfig.get("disconnection_ts") + serverConfig.get("reconnect_after_secs") - _getTimestamp();
                    //log("SERVER WAS DISCONNECTED @ " + disconnection_ts + " reconnecting in: " + connect_in_secs);
                    if (connect_in_secs <= 0) {
                        //serverConfig.set("disconnection_ts", _getTimestamp());//??really - why?
                        log("trying to reconnect(@"+serverConfig.get("disconnection_ts")+")...");
                        _connect().then(function() {
                            log("KeepAliveService: reconnection successful");
                        }).catch(function(e) {
                            log("KeepAliveService: reconnection failed: " + e.message);
                        });
                    }
                    return;//in any case don't go ahead 'coz we are not connected
                }

                //BAIL OUT IF BUSY
                if(_isBusy()) {return;}

                //#2 - CHECK FOR OPERATION IN QUEUE - IF ANY - AND EXECUTE

                //#3 - PING
                var ping_interval = parseInt(serverConfig.get("ping_interval"));
                var last_ping_ts = parseInt(serverConfig.get("last_ping_ts"));
                var ping_in_secs = last_ping_ts + ping_interval - _getTimestamp();
                if (ping_in_secs <= 0) {
                    serverConfig.set("last_ping_ts", _getTimestamp());
                    _ping();
                }
            };

            //----------------------------------------------------------------------- LOW LEVEL XHR COMMUNICATION METHOD
            /**
             * Set Up XMLHttpRequest and the event listeners
             * @private
             */
            var _setupXHR = function() {
                xhr = new XMLHttpRequest();
                xhr.timeout = 10 * 1000;//@todo: make editable option for this
                xhr.ontimeout = _XHR_timeout;
                xhr.onreadystatechange = _XHR_readystatechange;
            };

            /**
             *
             * @note SCO - {service:"name of service", options:{name:get_index, params:{...}}, ...}
             * @param {Object} SCO - the Server Communication Object
             * @return {Promise}
             */
            var _communicateWithServer = function(SCO) {
                return new Promise(function (fulfill, reject) {
                    operationQueue.push({SCO:SCO, fulfill:fulfill, reject:reject});
                    //log("OPERATION QUEUE LENGTH: " + operationQueue.length);
                    _executeNextOperationInQueue();
                });
            };

            var _executeNextOperationInQueue = function() {
                if (_isBusy() || operationQueue.length == 0) {
                    return;
                }
                //log("REMAINIG OPERATIONS IN QUEUE: " + operationQueue.length);
                var currentOperation = _.first(operationQueue);//get the first item in the queue
                operationQueue = _.rest(operationQueue);//remove the queue without the first item
                //
                _setBusy();
                _prepareRawPostData(currentOperation.SCO);
                _encryptRawPostData(currentOperation.SCO);
                xhr.customData = currentOperation;
                xhr.open("POST", serverConfig.get("url"), true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.send(currentOperation.SCO.postDataCrypted);
            };

            var _XHR_readystatechange = function() {
                var SCO = xhr.customData["SCO"];
                var fulfill = xhr.customData["fulfill"];
                //
                if (xhr.readyState == 4) {
                    if(xhr.status == 0) {
                        return _XHR_abort_and_reject(new Error("Connection refused!"));
                    } else if (xhr.status != 200) {
                        return _XHR_abort_and_reject(new Error("Server error!"));
                    }
                    _decryptSrvResponse(SCO);
                    if (SCO.responseObject == false || !_.isObject(SCO.responseObject)) {
                        return _XHR_abort_and_reject(new Error("Unable to decrypt server response!"));
                    }
                    if (SCO.service != "ping") {
                        log("SCO[IN](" + SCO.service + "):" + JSON.stringify(SCO.responseObject));
                    }
                    if(!_register_new_seed(SCO)) {
                        return _XHR_abort_and_reject(new Error("Unable to extract Seed or Timestamp or PadLengths from server response!"));
                    }
                    _setIdle();
                    PPMUtils.dispatchCustomEvent({type: 'server_xchange', index: serverConfig.get("index")});
                    xhr.customData = null;
                    fulfill(SCO);
                    _executeNextOperationInQueue();
                }
            };

            var _XHR_timeout = function() {
                return _XHR_abort_and_reject(new Error("Connection has timed out!"));
            };

            /**
             * Puts server in disconnected state before rejecting the promise
             * @param {Error} error
             * @return {*}
             */
            var _XHR_abort_and_reject = function(error) {
                var reject = xhr.customData["reject"];
                var serverMessage = "";
                if (!_.isUndefined(xhr.responseText) && !_.isEmpty(xhr.responseText)) {
                    try {
                        var serverResponse = JSON.parse(xhr.responseText);
                        if(!_.isUndefined(serverResponse["msg"]) && !_.isEmpty(serverResponse["msg"])) {
                            serverMessage =  " - The server says: " + serverResponse["msg"];
                        }
                    } catch(e) {/**/}
                }
                log("ERROR IN SERVER RESPONSE(" + error.message + ")" + serverMessage, "error");
                _putServerInDisconnectedState();
                xhr.abort();
                xhr.customData = null;
                _setIdle();
                reject(error);
                _executeNextOperationInQueue();
            };

            //---------------------------------------------------------------------------------------- PRIVATE UTILITIES
            /**
             * Registers from decrypted response things that we will need for next communication encryption
             * ::: seed, timestamp, leftPadLength, rightPadLength
             * If FAILS WILL PUT SERVER OFFLINE
             * @param {Object} SCO - the Server Communication Object
             * @returns Boolean - true on success | false on failure
             */
            var _register_new_seed = function(SCO) {
                if (SCO.service != "logout") {
                    if (_.isNull(SCO.responseObject.seed)
                        || _.isNull(SCO.responseObject.timestamp)
                        || _.isNull(SCO.responseObject.leftPadLength)
                        || _.isNull(SCO.responseObject.rightPadLength)
                    ) {
                        return false;
                    }
                    serverConfig.set("seed", SCO.responseObject.seed);
                    serverConfig.set("timestamp", SCO.responseObject.timestamp);
                    serverConfig.set("leftPadLength", SCO.responseObject.leftPadLength);
                    serverConfig.set("rightPadLength", SCO.responseObject.rightPadLength);
                }
                return true;
            };

            /**
             * Decrypts received data
             * @param {Object} SCO - the Server Communication Object
             */
            var _decryptSrvResponse = function(SCO) {
                var trimmedResponse = PPMUtils.leftRightTrimString(xhr.responseText, SCO.postDataRaw.leftPadLength, SCO.postDataRaw.rightPadLength);
                var decryptedResponse = CryptoModule.decryptAES(trimmedResponse, SCO.postDataRaw.seed);
                SCO.responseObject = PPMUtils.objectizeJsonString(decryptedResponse);
            };

            /**
             * Encrypts "postDataRaw" and pads the encrypted ciphertext with variable length rubbish
             * @todo: we should pad ONLY the ciphertext and not the entire string(both server and client mods needed)
             * @param {Object} SCO - the Server Communication Object
             */
            var _encryptRawPostData = function(SCO) {
                var Ed2s;
                var str2crypt = JSON.stringify(SCO.postDataRaw);
                if (SCO.service != "ping") {
                    log("SCO[postDataRaw]:" + str2crypt);
                }
                if (_.isNull(serverConfig.get("seed"))) {
                    //if we have no seed yet we must encrypt data with combination username & password (md5Hash of it 'coz server has only that)
                    //also padding will be done on both left and right side with the length of the username
                    Ed2s = CryptoModule.encryptAES(str2crypt, serverConfig.get("username"));
                    Ed2s = CryptoModule.encryptAES(Ed2s, CryptoModule.md5Hash(serverConfig.get("password")));
                    Ed2s = PPMUtils.leftRightPadString(Ed2s, serverConfig.get("username").length, serverConfig.get("username").length);
                } else {
                    //encrypt data normally with current seed, leftPadLength, rightPadLength
                    Ed2s = CryptoModule.encryptAES(str2crypt, serverConfig.get("seed"));
                    Ed2s = PPMUtils.leftRightPadString(Ed2s, serverConfig.get("leftPadLength"), serverConfig.get("rightPadLength"));
                }
                SCO.postDataCrypted = Ed2s;
            };

            /**
             * Prepare "postDataRaw" on SCO -> which will be stringified, encrypted and sent to server
             * @param {Object} SCO - the Server Communication Object
             */
            var _prepareRawPostData = function(SCO) {
                SCO.postDataRaw = {
                    service:            SCO.service,
                    seed:               PPMUtils.getGibberish(serverConfig.get("seed_length_min"), serverConfig.get("seed_length_max")),
                    leftPadLength:      PPMUtils.getRandomNumberInRange(serverConfig.get("padding_length_min"), serverConfig.get("padding_length_max")),
                    rightPadLength:     PPMUtils.getRandomNumberInRange(serverConfig.get("padding_length_min"), serverConfig.get("padding_length_max"))
                };
                //db operation parameters
                if(!_.isUndefined(SCO.operation)) {
                    SCO.postDataRaw.operation = SCO.operation;
                }
            };

            /**
             * Puts server in disconnected state - ready for reconnection
             * @private
             */
            var _putServerInDisconnectedState = function() {
                serverConfig.set("connected", false);
                serverConfig.set("seed", null);
                serverConfig.set("timestamp", null);
                serverConfig.set("leftPadLength", null);
                serverConfig.set("rightPadLength", null);
                serverConfig.set("disconnection_ts", _getTimestamp());
                serverConfig.set("connection_ts", null);
                PPMUtils.dispatchCustomEvent({type: 'server_state_change', index: serverConfig.get("index")});
            };

            var _getTimestamp = function() {return(Math.round((Date.now()/1000)));};
            var _isConnected = function() {return(serverConfig.get("connected"));};
            var _isBusy = function() {return(serverConfig.get("busy"));};
            var _setBusy = function() {serverConfig.set("busy", true);};
            var _setIdle = function() {serverConfig.set("busy", false);};

            //initialize server
            init();
        }

        return ParanoiaServer;
    }
);