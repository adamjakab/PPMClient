/**
 * Chrome browser window and tab utility methods
 */
define([
    'PPMLogger',
    'bluebird',
    'underscore'
], function (PPMLogger, Promise, _) {
    /**
     * Log facility
     * @param msg
     * @param type
     */
    var log = function (msg, type) {PPMLogger.log(msg, "CHROMETABS", type);};

    /**
     * This will hold Boolean value for each chrome tab so we can check if content script is present
     * @type {Array}
     */
    var contentScriptInjectedIntoTab = [];

    /**
     * Storage for active tab's id
     * @type {Object} - {"tabId":465,"windowId":14}
     */
    var activeWinTabInfo = null;

    /**
     * Registers required listeners
     * @todo: we also need tab closed event listeners
     */
    var registerWinTabFocusListeners = function() {
        log("Registering Win/Tab Listeners.");
        if(!chrome.windows.onFocusChanged.hasListener(windowFocusListener)) {
            chrome.windows.onFocusChanged.addListener(windowFocusListener);
            //execute it right away for the first time so that passcard count on current tab will be updated
            //windowFocusListener(chrome.windows.WINDOW_ID_CURRENT);
        }
        if(!chrome.tabs.onActivated.hasListener(tabFocusListener)) {
            chrome.tabs.onActivated.addListener(tabFocusListener);
        }
        if(!chrome.tabs.onUpdated.hasListener(tabUpdateListener)) {
            chrome.tabs.onUpdated.addListener(tabUpdateListener);
        }
    };

    /**
     * Unregisters listeners
     */
    var unregisterWinTabFocusListeners = function() {
        log("Unregistering Win/Tab Listeners.");
        if(chrome.windows.onFocusChanged.hasListener(windowFocusListener)) {
            chrome.windows.onFocusChanged.removeListener(windowFocusListener);
        }
        if(chrome.tabs.onActivated.hasListener(tabFocusListener)) {
            chrome.tabs.onActivated.removeListener(tabFocusListener);
        }
        if(chrome.tabs.onUpdated.hasListener(tabUpdateListener)) {
            chrome.tabs.onUpdated.removeListener(tabUpdateListener);
        }
    };

    /**
     * Called when a different browser window is selected by user
     * This event is used to get the active tab in the selected windows and
     * call the tabFocusListener so it can check for available passcards
     *
     * @param {Number} windowId
     */
    var windowFocusListener = function(windowId) {
        //log("windowFocusListener winId: " + windowId);
        chrome.tabs.query({windowId: windowId, active: true}, function(tabs) {
            var activeTab = tabs.pop();
            if(activeTab) {
                tabFocusListener({windowId: windowId, tabId: activeTab.id});
            }
        });
    };

    /**
     * Called when a different tab is selected by user
     * @param {Object} winTabInfo - something like {"tabId":465,"windowId":14}
     */
    var tabFocusListener = function(winTabInfo) {
        log("tabFocusListener info: " + JSON.stringify(winTabInfo));
        activeWinTabInfo = winTabInfo;
        injectContentScriptIntoTab(winTabInfo.tabId);
        //_checkPasscardAvailabilityForTab(aInfo.tabId);
    };

    /**
     * Called when tab content changes
     * @param {Number} tabId
     * @param {Object} changeInfo - {"status":"loading"} / {"status":"complete"}
     */
    var tabUpdateListener = function(tabId, changeInfo) {
        log("tabUpdateListener tabId: " + tabId + " changeInfo: " + JSON.stringify(changeInfo));
        contentScriptInjectedIntoTab[tabId] = false;
        if(changeInfo.status == "complete") {
            //_checkPasscardAvailabilityForTab(tId);
        }
    };



    /**
     * OK: frames/Iframes work - sometimes page must be updated ++times because here we don't know loaded status of inner frame contents
     *      - so we might be injecting script into half-loaded content -> and so content script doesn't work
     * TODO: on closing tabs we should remove them from tabContentScriptStates array
     * @param {Number} tabId
     */
    var injectContentScriptIntoTab = function(tabId) {
        if(!contentScriptInjectedIntoTab[tabId]) {
            chrome.tabs.get(tabId, function(tab) {
                var protocolRegExp = new RegExp('(http|https):\/\/', '');
                if(protocolRegExp.test(tab.url)) {
                    chrome.tabs.executeScript(tabId, {
                        file: "app/lib/PPM2ContentScript.js",
                        allFrames: true
                    }, function(resArr) {
                        log("Content Script was injected into tab #" + tabId + "resArr: " + JSON.stringify(resArr));
                        contentScriptInjectedIntoTab[tabId] = true;
                    });
                }
            });
        }
    };



    return {
        /**
         * Initialize component
         * @returns {Promise}
         */
        initialize: function () {
            return new Promise(function (fulfill, reject) {
                registerWinTabFocusListeners();
                log("INITIALIZED", "info");
                fulfill();
            });
        },

        /**
         * Shut down component
         * @returns {Promise}
         */
        shutdown: function () {
            return new Promise(function (fulfill, reject) {
                unregisterWinTabFocusListeners();
                log("SHUTDOWN COMPLETED", "info");
                fulfill();
            });
        }
    }
});