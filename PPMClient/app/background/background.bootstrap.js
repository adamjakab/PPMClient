/**
 * Main background application
 */
requirejs.config({
    baseUrl: './background',
    paths: {
        lib: '../lib',
        underscore: '../../vendor/js/underscore',
        bluebird: '../../vendor/js/bluebird'

    },
    shim: {

    },
    deps: ['bluebird', 'underscore']
});

/**
 * Exposing PPM for popup/options usage with:
 * chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
 */
var ParanoiaPasswordManager;

require(['ParanoiaPasswordManager'], function(PPM) {
    ParanoiaPasswordManager = PPM;

    /**
     * Reinizialises the entire application
     */
    var restartApplication = function() {
        PPM.initialize().then(function() {
            /**
             * todo: to be removed (TESTING ONLY)
             */
            var _DO_AUTOLOGIN_ = false;
            if(_DO_AUTOLOGIN_) {
                PPM.login("DEFAULT", "Paranoia");
            }
        });
    };

    //autostart application
    restartApplication();


    //OMNIBOX COMMANDS
    chrome.omnibox.onInputEntered.addListener(function(cmd) {
        switch(cmd){
            case "resetStorage":
                if(confirm("Are you sure you want to reset all local and sync storage to default values?\nAll your configuration will be lost and default settings will be applied!")) {
                    chrome.storage.local.clear();
                    chrome.storage.sync.clear();
                    alert("All storage areas have been cleared!");
                    restartApplication();
                }
                break;
            default:
                alert('PPM - I do not understand the command: "' + cmd + '"');
                break;
        }
    });

});

