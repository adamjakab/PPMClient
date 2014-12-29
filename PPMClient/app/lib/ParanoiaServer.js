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

        var log = function(msg, type) {logger.log(msg, "PPMServer", type);};

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
                reconnect_after_secs: 10,//if server disconnects after this number of seconds server will try to reconnect
                disconnection_ts: 0,
                last_ping_ts: 0,
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
                KASEI: 5000 //KeepAliveService Execution Interval
            });

            /**
             * Log facility
             * @param msg
             * @param type
             */
            var log = function(msg, type) {logger.log(msg, "PPMServer["+serverConfig.get("index")+"]", type);};
            log("Server is created: " + JSON.stringify(serverConfig.getAll()));

            //-------------------------------------------------------------------------------------------------- CONNECT
            /**
             * Connects the server
             * @return {Promise}
             */
            this.connect = function() {
                return new Promise(function (fulfill, reject) {
                    if(_isConnected()) {
                        reject(new Error("Server is already connected"));
                    }
                    _communicateWithServer({
                        service: "login"
                    }).then(
                        /**
                         *
                         * @param {Object} SCO - the Server Communication Object
                         */
                        function(SCO) {
                            serverConfig.set("connected", true);
                            //_keepAliveServiceStart();
                            log("connected");
                            log("SCO: " + JSON.stringify(SCO));
                            fulfill();
                        }
                    ).error(function(e) {
                        log(e, "error");
                        //return reject(e);
                    }).catch(function(e) {
                        log(e, "error");
                        //return reject(e);
                    });

                });
            };

            //----------------------------------------------------------------------------------------------- DISCONNECT




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
                        if (!_.isUndefined(SCO.xhr.responseText) && _.isObject(JSON.parse(SCO.xhr.responseText))) {
                            var serverResponse = JSON.parse(SCO.xhr.responseText);
                            serverMessage = serverResponse.msg;
                            log("Server says: " + serverMessage, "error");
                        }
                        SCO.errorMessage = "_communicateWithServer ERROR: " + error + " " + serverMessage;
                        log("ERROR IN SERVER RESPONSE SCO: " + JSON.stringify(SCO), "error");
                        _putServerInDisconnectedState();
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
            function _register_new_seed(SCO) {
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
            }

            /**
             * Decrypts received data
             * @param {Object} SCO - the Server Communication Object
             */
            var _decryptSrvResponse = function(SCO) {
                var trimmedResponse = utils.leftRightTrimString(SCO.xhr.responseText, SCO.postDataRaw.leftPadLength, SCO.postDataRaw.rightPadLength);
                SCO.responseObject = cryptor.decryptAES(trimmedResponse, SCO.postDataRaw.seed, true);
            };

            /**
             * Encrypts "postDataRaw" on SCO
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