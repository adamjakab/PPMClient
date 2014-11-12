/**
 * The main PPM Thread (all starts here...)
 */
function ParanoiaPasswordManager() {
    var self = this;
    var _DO_AUTOLOGIN_ = false;//TESTING ONLY
    var _components = {
        "LOGGER":           {component: null, type: PPMLogger},
        "UTILS":            {component: null, type: PPMUtils},
        "CRYPTOR":          {component: null, type: PPMCryptor},
        "CHROMESTORAGE":    {component: null, type: ChromeStorage},
        "PPMSTORAGE":       {component: null, type: PPMStorage},
        "GATRACKER":        {component: null, type: GoogleAnalyticsTracker}
    };

    /**
     * @param {string} msg
     * @param {string} [zone]
     */
    var _log = function(msg, zone) {
        if(_getComponent("LOGGER")) {
            _getComponent("LOGGER").log(msg, zone);
        }
    };

    /**
     * Get a main PPM component
     * @param name
     * @return {*} answer
     */
    var _getComponent = function(name) {
        var answer = false;
        if(_components.hasOwnProperty(name)) {
            if(_components[name].component != null && _components[name].component instanceof _components[name].type) {
                answer = _components[name].component;
            }
        }
        return(answer);
    };
    /**
     * @param name
     * @return {*} answer
     */
    this.getComponent = function(name) {
        return(_getComponent(name));
    };

    /**
     * AngularJs is loaded as background script so to minimize loading it into popup every time
     * Bootstrap it manually (see: http://docs.angularjs.org/guide/bootstrap)
     * @returns {angular}
     */
    this.getAngularJs = function() {
        return(angular);
    };




    /**
     * Init/Re-Init PPM
     * @param {string} [profile] - The name of the profile to decrypt
     * @param {string} [masterKey] - The key to use for decryption
     * @param {function} cb - The callback function
     */
    var _init = function(profile, masterKey, cb) {
        _log("PHASE 1(INIT)" + (profile&&masterKey?" - [logging into profile: "+profile+"]":"[no profile]") + "...", "Main");

        //CREATE AND INIT LOGGER
        if(!_getComponent("LOGGER")) {
            _components["LOGGER"].component = new PPMLogger(self, {"do_console_logging":true});//PPMLogger.js
            _getComponent("LOGGER").init();
        }

        //CREATE AND INIT UTILS
        if(!_getComponent("UTILS")) {
            _components["UTILS"].component = new PPMUtils(self);//PPMUtils.js
            _getComponent("UTILS").init();
        }

        //CREATE AND INIT CRYPTOR
        if(!_getComponent("CRYPTOR")) {
            _components["CRYPTOR"].component = new PPMCryptor(self);//PPMCryptor.js
            _getComponent("CRYPTOR").init();
        }

        //CREATE AND INIT GA TRACKING CODE
        if(!_getComponent("GATRACKER")) {
            _components["GATRACKER"].component = new GoogleAnalyticsTracker(self);//GoogleAnalyticsTracker.js
            _getComponent("GATRACKER").init();
        }

        //CREATE AND INIT CHROME STORAGE (ALWAYS NEW)
        _components["CHROMESTORAGE"].component = new ChromeStorage(self);//ChromeStorage.js
        _getComponent("CHROMESTORAGE").init();

        //CREATE AND INIT CHROME STORAGE (ALWAYS NEW)
        _components["PPMSTORAGE"].component = new PPMStorage(self);//ChromeStorage.js
        _getComponent("PPMSTORAGE").init();

        //START PHASE 2
        _phase_2();

        function _phase_2() {
            _log("PHASE 2(DECRYPT PROFILE)...","Main");
            _getComponent("CHROMESTORAGE").setupLocalAndSyncedStorages(profile, masterKey, _phase_3);
        }

        function _phase_3() {
            _log("PHASE 3(SETUP SERVERS)...","Main");
            _getComponent("PPMSTORAGE").setupServers(_phase_4);
        }

        function _phase_4() {
            _log("PHASE 4(DONE)...","Main");
            if(_getComponent("UTILS").isFunction(cb)) {cb();}

            //@TODO: AUTOLOGIN!!! - remove this!!!
            //---------------------------------------------------------------------------------
            if (_DO_AUTOLOGIN_) {
                _DO_AUTOLOGIN_ = false;
                if(!_getComponent("CHROMESTORAGE").isInited()) {
                    _log("TRYING AUTOLOGIN...", "Main");
                    _init("DEFAULT", "Paranoia", function() {
                        _log("PHASE 2/AUTOLOGIN: DONE("+(_getComponent("CHROMESTORAGE").isInited()?"SUCCESS":"FAILED")+")", "Main");
                    });
                }
            }
            //----------------------------------------------------------------------------------
        }
    };
    this.reInit = function(profile, masterKey, cb) {
        _init(profile, masterKey, cb);
    };


    var _shutdown = function(cb) {
        _log("SHUTDOWN PHASE 1...", "Main");
        _getComponent("PPMSTORAGE").shutdown(_phase_2);

        function _phase_2() {
            _log("SHUTDOWN PHASE 2...","Main");
            _getComponent("CHROMESTORAGE").shutdown(_phase_3);
        }

        function _phase_3() {
            _log("SHUTDOWN PHASE 3...","Main");
            _init(null, null, function() {
                _log("SHUTDOWN PHASE 3 COMPLETED - PPM HAS BEEN REINITIALIZED.", "Main");
                if(_getComponent("UTILS").isFunction(cb)) {cb();}
            });
        }
    };
    this.shutdown = function(cb) {
        _shutdown(cb);
    };


    /**
     * PPM CustomEvent Listener - main event listener
     * DISPATCH CUSTOM EVENT LIKE THIS: UTILS.dispatchCustomEvent({type:"state_change", ...});
     */
    var PpmCustomEventListener = function(e) {
        if(e && e.detail && e.detail.type) {
            _log("CustomEvent["+e.detail.type+"] -> " + JSON.stringify(e.detail), "Main");
            switch (e.detail.type) {
                case "test":
                    //;) testing
                    break;
                case "state_change":
                    _getComponent("UTILS").updateStateIcon();
                    break;
                case "storage_change":
                    //_getComponent("UTILS").handleStorageChangeEvent();
                    break;
                default:
                    log("customEventListener - Event type is unknown: " + e.detail.type, "Main");
            }
        } else {
            log("customEventListener - Event type is not defined!", "Main");
        }
    };
    //
    document.addEventListener("PPM", PpmCustomEventListener, false);

    //auto fire-up!
    console.log("Firing up Paranoia Password Manager...");
    _init(null, null, function() {
        _log("PPM is ready.", "Main");
    });
}


/** @type ParanoiaPasswordManager PPM */
var PPM;
document.addEventListener('DOMContentLoaded', function () {
    PPM = new ParanoiaPasswordManager();
});



//OMNIBOX COMMANDS
chrome.omnibox.onInputEntered.addListener(function(cmd) {
    switch(cmd){
        case "resetStorage":
            if(confirm("Are you sure you want to reset all local and sync storage to default values?\nAll your configuration will be lost and default settings will be applied!")) {
                chrome.storage.local.clear();
                chrome.storage.sync.clear();
                alert("All storage areas have been cleared!");
                PPM = new ParanoiaPasswordManager();
            }
            break;
        default:
            alert('PPM - I do not understand the command: "' + cmd + '"');
            break;
    }

});

