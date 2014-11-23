requirejs.config({
    baseUrl: 'js',
    paths: {
        underscore: '../bower/underscore/underscore',
        bluebird: '../bower/bluebird/js/browser/bluebird'
    },
    shim: {

    }
});

require(['app/ParanoiaPasswordManager'], function(PPM) {
    //todo: to be removed
    var _DO_AUTOLOGIN_ = true;

    var restartApplication = function() {
        PPM.initialize();
        /**
         * todo: to be removed
         * TESTING ONLY
         * @type {boolean}
         * @private
         */
        if(_DO_AUTOLOGIN_) {
            PPM.login("DEFAULT", "Paranoia");
        } else {
            PPM.login();
        }
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

