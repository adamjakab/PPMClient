/**
 * Main passcard storage interface
 * @param {ParanoiaPasswordManager} PPM
 * @param {object} [options]
 */
function PPMStorage(PPM, options) {
    var cfg = new ConfigOptions({});
    cfg.merge(options);

    /** @type ChromeStorage */
    var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
    /** @type PPMUtils UTILS */
    var UTILS = PPM.getComponent("UTILS");
    var servers = [];
    var storage = [];
    var queue = [];
    var initialDataIndexLoaded = false;

    var log = function(msg, type) {PPM.getComponent("LOGGER").log(msg, "PPMStorage", type);};

    this.init = function() {
        log("INITIALIZED: " + JSON.stringify(cfg.getRecursiveOptions()), "info");
    };

    this.setupServers = function(cb) {
        if(CHROMESTORAGE.isInited()) {
            log("setting up servers...");
            _registerServers();
        } else {
            log("not ready to set up servers...");
        }
        if(PPM.getComponent("UTILS").isFunction(cb)) {cb();}
    };

    this.shutdown = function(cb) {
        log("shutting down...");
        _unregisterServers();
        if(PPM.getComponent("UTILS").isFunction(cb)) {cb();}
    };

    this.getNumberOfRegisteredServers = function() {
        return(_getNumberOfRegisteredServers());
    };

    this.getServerByIndex = function(index) {
        var answer = false;
        if(servers.hasOwnProperty(index)) {
            answer = servers[index];
        }
        return(answer);
    };


    var _registerServers = function() {
        servers = [];
        queue = [];
        var srvList = CHROMESTORAGE.getOption("sync", "srv");
        log("Registering Paranoia Servers...");
        for(var srvIndex in srvList) {
            if(srvList.hasOwnProperty(srvIndex)) {
                var srvConfig = srvList[srvIndex];
                srvConfig.index = srvIndex;
                servers[srvIndex] = new ParanoiaServer(PPM, srvConfig);
                servers[srvIndex].connect(function(index, success) {
                    log("Server["+index+"] connection was: " + (success?"Successful":"Fail"));
                });
            }
        }
        var srvCnt = _getNumberOfRegisteredServers();
        if (srvCnt == 0) {
            log("There are no servers configured.");
        } else {
            log("Registered "+srvCnt+" servers successfully.");
        }
    };

    var _unregisterServers = function() {
        //todo: we need this for shutdown
    };

    var _getNumberOfRegisteredServers = function() {
        return(Object.keys(servers).length);
    };



    /**
     * Returns true if all servers have been connected and initial data index has been loaded
     * @returns {boolean}
     */
    this.isInited = function() {
        return(this.isInitialDataIndexLoaded() && this.areAllServersConnected());
    };

    /**
     * Returns true if initial data index has been loaded
     * @returns {boolean}
     */
    this.isInitialDataIndexLoaded = function() {
        return(initialDataIndexLoaded);
    };

    /**
     * Returns true if all servers have been connected
     * @returns {boolean}
     */
    this.areAllServersConnected = function() {
        return(false);
    }

}
