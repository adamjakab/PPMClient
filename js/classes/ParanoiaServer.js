/**
 * @param {ParanoiaPasswordManager} PPM
 * @param {Object} cfg
 * @constructor
 */
function ParanoiaServer(PPM, cfg) {
    var config = cfg;
    var is_connected = false;
    var is_busy = false;
    //
    var reconnect_after_secs = 10;//if server disconnects after this number of seconds server will try to reconnect
    var disconnection_ts = 0;
    var last_ping_ts = 0;
    //
    var seed_length_min = 24;
    var seed_length_max = 32;
    var padding_length_min = 48;
    var padding_length_max = 64;
    //
    var seed = null;
    var timestamp = null;
    var leftPadLength = null;
    var rightPadLength = null;
    //
    var KASIREF = null;//KeepAliveService Interval Reference
    var KASEI = 5000;//KeepAliveService Execution Interval


    /** @type PPMUtils UTILS */
    var UTILS = PPM.getComponent("UTILS");
    /** @type PPMCryptor CRYPTOR */
    var CRYPTOR = PPM.getComponent("CRYPTOR");

    var log = function(msg, type) {PPM.getComponent("LOGGER").log(msg, "ParanoiaServer["+config.index+"]", type);};
    log("Setting up with config: " + JSON.stringify(config));



    this.connect = function(cb) {
        _connect(function(success) {
            log("Connect Done...");
            if (UTILS.isFunction(cb)) {cb(config.index, success);}
        });
    };

    this.disconnect = function(cb) {
        _disconnect(function(success) {
            log("Disconnect Done...");
            if (UTILS.isFunction(cb)) {cb(config.index, success);}
        });
    };

    this.getStateData = function() {
        var answer = {
            connected: is_connected,
            busy: is_busy,
            seed: seed,
            timestamp: timestamp,
            leftPadLength: leftPadLength,
            rightPadLength: rightPadLength
        };
        return(answer);
    };

    //---------------------------------------------------------------------------------------------CONNECT SERVER
    var _connect = function(cb) {
        log("connecting(PHASE1)...");
        _comunicateWithServer({
            service: "login",
            callback: _connect_phase_2,
            original_callback: cb
        });

        function _connect_phase_2(SCO) {
            is_connected = SCO.success===true;
            log("connect(PHASE2)..." + (SCO.success?"OK":"ERR!"));
            _keepAliveServiceStart();
            if (UTILS.isFunction(SCO.original_callback)) {SCO.original_callback(SCO.success);}
        }
    };

    //---------------------------------------------------------------------------------------------DISCONNECT SERVER
    var _disconnect = function(cb) {
        log("disconnecting(PHASE1)...");
        _keepAliveServiceStop();
        _comunicateWithServer({
            service: "logout",
            callback: _disconnect_phase_2,
            original_callback: cb
        });

        function _disconnect_phase_2(SCO) {
            is_connected = (SCO.success===true?false:is_connected);
            if(!is_connected) {_putServerInDisconnectedState();}
            log("disconnect(PHASE2)..." + (SCO.success?"OK":"ERR!"));
            if (UTILS.isFunction(SCO.original_callback)) {SCO.original_callback(SCO.success);}
        }
    };

    //---------------------------------------------------------------------------------------------PING SERVER
    var _ping = function() {
        log("pinging(PHASE1)...");
        _comunicateWithServer({
            service: "ping",
            callback: _ping_phase_2
        });

        function _ping_phase_2(SCO) {
            log("pinging(PHASE2)..." + (SCO.success?"OK":"ERR!"));
        }

    };



    /*-------------------------------------------------------------------------------------PRIVATE METHODS*/
    /**
     * Low level Xhr comunication interface with PPM server
     * SCO === (ServerComunicationObject)
     * {service:"name of service", callback:"callback function", options:{name:get_index, params:{...}}, ...}
     */
    var _comunicateWithServer = function(SCO) {
        try {
            if(!_isBusy()) {
                _setBusy();
                _prepareRawPostData(SCO);
                _encryptRawPostData(SCO);
                if(SCO.service != "ping") {
                    log("SCO[postDataRaw]:"+JSON.stringify(SCO.postDataRaw));
                }
                var xhr = new XMLHttpRequest();
                xhr.open("POST", config.url, true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.onreadystatechange = function(ev) {
                    if (ev.target && ev.target.readyState == 4) {
                        SCO.success = true;
                        SCO.xhr = ev.target;
                        _comunicateWithServerDone(SCO);
                    }
                };
                xhr.send(SCO.postDataCrypted);
            } else {
                SCO.success = false;
                SCO.errorMessage = "Server is busy!";
                _comunicateWithServerDone(SCO);
            }
        } catch(err) {
            SCO.success = false;
            SCO.errorMessage = "COM_ERROR: " + err;
            _comunicateWithServerDone(SCO);
        }

        function _comunicateWithServerDone(SCO) {
            try{
                if (SCO.success) {
                    //DECRYPT RESPONSE
                    _decryptSrvResponse(SCO);
                    if(SCO.responseObject!==false) {
                        if(SCO.service != "ping") {
                            log("SCO[IN]("+SCO.service+"):"+JSON.stringify(SCO.responseObject));
                        }
                        //REGISTER NEW SEED
                        SCO.hasNewSeed = _register_new_seed(SCO);
                        _setIdle();
                        if (SCO.callback && typeof SCO.callback == "function") {
                            SCO.callback(SCO);
                        }
                    } else{
                        throw("Unable to parse server response!");
                    }
                } else {
                    //log(SCO.errorMessage, "warning");
                    //_returnToCaller();
                }
            } catch (err) {
                SCO.success = false;
                SCO.errorMessage = "_comunicateWithServerDone ERROR: " + err;
                log("ERROR IN SERVER RESPONSE SCO: " + JSON.stringify(SCO), "error");
                _putServerInDisconnectedState();
                _returnToCaller();
            }
        }

        /**
         * Registers from decrypted response things that we will need for next communication encryption
         * ::: seed, timestamp, leftPadLength, rightPadLength
         * If FAILS WILL PUT SERVER OFFLINE
         * @param {Object} SCO
         * @private
         */
        function _register_new_seed(SCO) {
            try {
                if (SCO.service != "logout") {
                    seed = SCO.responseObject.seed;
                    timestamp = SCO.responseObject.timestamp;
                    leftPadLength = SCO.responseObject.leftPadLength;
                    rightPadLength = SCO.responseObject.rightPadLength;
                    if (seed == null || timestamp == null || leftPadLength == null || rightPadLength == null) {
                        throw ("Unable to extract Seed or Timestamp or PadLengths from server response");
                    }
                }
            } catch (e) {
                log("SEED REGISTRATION FAILED: " + e);
                _putServerInDisconnectedState();
                return (false);
            }
            return(true);
        }

        function _returnToCaller() {
            _setIdle();
            if (UTILS.isFunction(SCO.callback)) {
                SCO.callback(SCO);
            }
        }
    };

    //---------------------------------------------------KEEP-ALIVE SERVICE
    var _keepAliveServiceStart = function() {
        if(KASIREF == null) {
            log("Starting Keep Alive Service");
            KASIREF = setInterval(_keepAliveServiceMainThread, KASEI);
        }
    };
    var _keepAliveServiceStop = function() {
        log("Stopping Keep Alive Service");
        clearInterval(KASIREF);
        KASIREF = null;
    };
    var _keepAliveServiceMainThread = function() {
        log("KAS...");
        //#1 - CHECK IF CONNECTED AND RECONNECT AUTOMATICALLY IF NOT
        if (is_connected !== true){
            //OOOOPS WE ARE DISCONNECTED - LET'S WAIT UNTIL "reconnect_after_secs" passes and then lets try to reconnect
            var connect_in_secs = disconnection_ts + reconnect_after_secs - _getTimestamp();
            //log("SERVER WAS DISCONNECTED @ " + disconnection_ts + " reconnecting in: " + connect_in_secs);
            if (connect_in_secs <= 0) {
                disconnection_ts = _getTimestamp();
                log("trying to reconnect(@"+disconnection_ts+")...");
                _connect(null);
            }
            return;//in any case don't go ahead 'coz we are not connected
        }

        //BAIL OUT IF BUSY
        if(_isBusy()) {return;}

        //#2 - CHECK FOR OPERATION IN QUEUE - IF ANY - AND EXECUTE

        //#3 - PING
        if ((last_ping_ts + parseInt(config.ping_interval)) < _getTimestamp()) {
            last_ping_ts = _getTimestamp();
            _ping();
        }

    };




    /**
     * Prepare "postDataRaw" on SCO -> which will be stringified, crypted and sent to server
     * @param {Object} SCO
     */
    var _prepareRawPostData = function(SCO) {
        SCO.postDataRaw = {
            service:            SCO.service,
            seed:               UTILS.getUglyString(seed_length_min, seed_length_max),
            leftPadLength:      UTILS.getRandomNumberInRange(padding_length_min, padding_length_max),
            rightPadLength:     UTILS.getRandomNumberInRange(padding_length_min, padding_length_max)
        };
    };

    var _encryptRawPostData = function(SCO) {
        var Ed2s;
        var str2crypt = JSON.stringify(SCO.postDataRaw);
        if (seed == null) {
            //if we have no seed yet we must encrypt data with combination username & password (md5hash of it 'coz server has only that)
            //also padding will be done on both left and right side with the length of the username
            Ed2s = CRYPTOR.encrypt(str2crypt, config.username);
            Ed2s = CRYPTOR.encrypt(Ed2s, CRYPTOR.md5Hash(config.password));
            Ed2s = UTILS.leftRightPadString(Ed2s, config.username.length, config.username.length);
        } else {
            //encrypt data normally with current seed, leftPadLength, rightPadLength
            Ed2s = CRYPTOR.encrypt(str2crypt, seed);
            Ed2s = UTILS.leftRightPadString(Ed2s, leftPadLength, rightPadLength);
        }
        SCO.postDataCrypted = Ed2s;
    };

    var _decryptSrvResponse = function(SCO) {
        var trimmedResponse = UTILS.leftRightTrimString(SCO.xhr.responseText, SCO.postDataRaw.leftPadLength, SCO.postDataRaw.rightPadLength);
        SCO.responseObject = CRYPTOR.decrypt(trimmedResponse, SCO.postDataRaw.seed, true);
    };

    var _putServerInDisconnectedState = function() {
        is_connected = false;
        seed = null;
        timestamp = null;
        leftPadLength = null;
        rightPadLength = null;
        disconnection_ts = _getTimestamp();//so we know when we disconnected and can do auto reconnection after some time
    };


    var _getTimestamp = function() {return(Math.round((Date.now()/1000)));};

    var _isBusy = function() {return(is_busy);};
    var _setBusy = function() {is_busy = true;};
    var _setIdle = function() {is_busy = false;}
}
