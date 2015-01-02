/**
 * Paranoia Server implementation
 */
define([
        'PPMLogger',
        'PPMUtils',
        'PPMCryptor',
        'bluebird',
        'underscore'
    ],
    function(logger, utils, cryptor, Promise, _) {
        /**
         *
         * @param {ConfigurationManager} srvCfg
         * @constructor
         */
        function ParanoiaServer(srvCfg) {
            /**
             * @type {ConfigurationManager}
             */
            var serverConfig = srvCfg;
            /* @todo: Some of this stuff should be configurable */
            serverConfig.merge({
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

            /**
             * Log facility
             * @param msg
             * @param type
             */
            var log = function(msg, type) {logger.log(msg, "PPMServer["+serverConfig.get("index")+"]", type);};
            log("Server is created: " + JSON.stringify(serverConfig.getAll()));

            /**
             * @return {{connected: *, busy: *, seed: *, timestamp: *, leftPadLength: *, rightPadLength: *}}
             */
            this.getServerState = function() {
                return {
                    connected: serverConfig.get("connected", false),
                    busy: serverConfig.get("busy", false),
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
             * @return {Promise}
             */
            var connect = function() {
                return new Promise(function (fulfill, reject) {
                    if(_isConnected()) {
                        return reject(new Error("Server is already connected"));
                    }
                    _keepAliveServiceStart();
                    _communicateWithServer({service: "login"}).then(function(SCO) {
                        serverConfig.set("connected", true);
                        serverConfig.set("connection_ts", _getTimestamp());
                        utils.dispatchCustomEvent({type: 'server_state_change', index: serverConfig.get("index")});
                        log("connected");
                        fulfill();
                    }).catch(function(e) {
                        return reject(e);
                    });
                });
            };
            this.connect = connect;

            //----------------------------------------------------------------------------------------------- DISCONNECT
            /**
             * Disonnects the server
             * @return {Promise}
             */
            var disconnect = function() {
                return new Promise(function (fulfill, reject) {
                    if(!_isConnected()) {
                        return reject(new Error("Server is already disconnected"));
                    }
                    _keepAliveServiceStop();
                    _communicateWithServer({service: "logout"}).then(function(SCO) {
                        serverConfig.set("connected", false);
                        _putServerInDisconnectedState();
                        utils.dispatchCustomEvent({type: 'server_state_change', index: serverConfig.get("index")});
                        log("disconnected");
                        fulfill();
                    }).catch(function(e) {
                        return reject(e);
                    });
                });
            };
            this.disconnect = disconnect;

            //------------------------------------------------------------------------------------------------------PING
            var _ping = function() {
                _communicateWithServer({service: "ping"}).then(function(SCO) {
                    log("pinged("+SCO.responseObject.msg+")");
                }).catch(function(e) {
                    log(e, "error");
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
                        connect().then(function() {
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
                var ping_in_secs = parseInt(serverConfig.get("last_ping_ts"))+parseInt(serverConfig.get("ping_interval"))-_getTimestamp();
                if (ping_in_secs <= 0) {
                    serverConfig.set("last_ping_ts", _getTimestamp());
                    _ping();
                }
            };




            //----------------------------------------------------------------------- LOW LEVEL XHR COMMUNICATION METHOD
            /**
             *
             * @note SCO - {service:"name of service", options:{name:get_index, params:{...}}, ...}
             * @param {Object} SCO - the Server Communication Object
             * @return {Promise}
             */
            var _communicateWithServer = function(SCO) {
                return new Promise(function (fulfill, reject) {
                    /**
                     * Puts server in disconnected state before rejecting the promise
                     * @param {Error} error
                     * @return {*}
                     */
                    var disconnectAndReject = function(error) {
                        var serverMessage = "";
                        if (!_.isUndefined(SCO.xhr.responseText) && !_.isEmpty(SCO.xhr.responseText)) {
                            try {
                                var serverResponse = JSON.parse(SCO.xhr.responseText);
                                serverMessage = serverResponse.msg;
                            } catch(e) {/**/}
                        }
                        log("ERROR IN SERVER RESPONSE(" + error.message + ") - The server says: " + serverMessage, "error");
                        _putServerInDisconnectedState();
                        utils.dispatchCustomEvent({type: 'server_state_change', index: serverConfig.get("index")});
                        _setIdle();
                        return reject(error);
                    };

                    if (_isBusy()) {
                        return reject(new Error("Server is busy!"));
                    }
                    _setBusy();
                    _prepareRawPostData(SCO);
                    _encryptRawPostData(SCO);
                    if (SCO.service != "ping") {
                        log("SCO[postDataRaw]:" + JSON.stringify(SCO.postDataRaw));
                    }
                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", serverConfig.get("url"), true);
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    xhr.onreadystatechange = function (ev) {
                        if (ev.target && ev.target.readyState == 4) {
                            SCO.xhr = ev.target;
                            _decryptSrvResponse(SCO);
                            if (SCO.responseObject == false) {
                                return disconnectAndReject(new Error("Unable to decrypt server response!"));
                            } else if (!_.isObject(SCO.responseObject)) {
                                return disconnectAndReject(new Error("Unable to parse server response!"));
                            }
                            if (SCO.service != "ping") {
                                log("SCO[IN](" + SCO.service + "):" + JSON.stringify(SCO.responseObject));
                            }
                            if(!_register_new_seed(SCO)) {
                                return disconnectAndReject(new Error("Unable to extract Seed or Timestamp or PadLengths from server response"));
                            }
                            _setIdle();
                            utils.dispatchCustomEvent({type: 'server_state_change', index: serverConfig.get("index")});
                            fulfill(SCO);
                        }
                    };
                    xhr.send(SCO.postDataCrypted);
                });
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
                var trimmedResponse = utils.leftRightTrimString(SCO.xhr.responseText, SCO.postDataRaw.leftPadLength, SCO.postDataRaw.rightPadLength);
                SCO.responseObject = cryptor.decryptAES(trimmedResponse, SCO.postDataRaw.seed, true);
            };

            /**
             * Encrypts "postDataRaw" and pads the encrypted ciphertext with variable length rubbish
             * @todo: we should pad ONLY the ciphertext and not the entire string(both server and client mods needed)
             * @param {Object} SCO - the Server Communication Object
             */
            var _encryptRawPostData = function(SCO) {
                var Ed2s;
                var str2crypt = JSON.stringify(SCO.postDataRaw);
                if (_.isNull(serverConfig.get("seed"))) {
                    //if we have no seed yet we must encrypt data with combination username & password (md5hash of it 'coz server has only that)
                    //also padding will be done on both left and right side with the length of the username
                    Ed2s = cryptor.encryptAES(str2crypt, serverConfig.get("username"));
                    Ed2s = cryptor.encryptAES(Ed2s, cryptor.md5hash(serverConfig.get("password")));
                    Ed2s = utils.leftRightPadString(Ed2s, serverConfig.get("username").length, serverConfig.get("username").length);
                } else {
                    //encrypt data normally with current seed, leftPadLength, rightPadLength
                    Ed2s = cryptor.encryptAES(str2crypt, serverConfig.get("seed"));
                    Ed2s = utils.leftRightPadString(Ed2s, serverConfig.get("leftPadLength"), serverConfig.get("rightPadLength"));
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
                    seed:               utils.getGibberish(serverConfig.get("seed_length_min"), serverConfig.get("seed_length_max")),
                    leftPadLength:      utils.getRandomNumberInRange(serverConfig.get("padding_length_min"), serverConfig.get("padding_length_max")),
                    rightPadLength:     utils.getRandomNumberInRange(serverConfig.get("padding_length_min"), serverConfig.get("padding_length_max"))
                };
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
            };

            var _getTimestamp = function() {return(Math.round((Date.now()/1000)));};
            var _isConnected = function() {return(serverConfig.get("connected"));};
            var _isBusy = function() {return(serverConfig.get("busy"));};
            var _setBusy = function() {serverConfig.set("busy", true);};
            var _setIdle = function() {serverConfig.set("busy", false);};
        }

        return ParanoiaServer;
    }
);