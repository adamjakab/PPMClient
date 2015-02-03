/**
 * Main background application
 *
 * Exposes ParanoiaPasswordManager variable for popup/options:
 * chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
 */
var ParanoiaPasswordManager;

require(['ParanoiaPasswordManager'], function(PPM) {
    ParanoiaPasswordManager = PPM;

    /**
     * Start/restart the application
     */
    var restartApplication = function() {
        PPM.initialize().catch(function (e) {
            console.error(e);
            window.location.reload(true);
        });
    };
    //autostart
    restartApplication();


    //OMNIBOX COMMANDS
    chrome.omnibox.onInputEntered.addListener(function(cmd) {
        switch(cmd){
            case "help":
                alert("You can use one of the following commands: resetStorage");
                break;
            case "resetLocalStorage":
                if(confirm("Are you sure you want to reset local storage to default values?")) {
                    chrome.storage.local.clear();
                    alert("Loacl storage has been cleared!");
                    window.location.reload(true);
                }
                break;
            case "resetSyncStorage":
                if(confirm("Are you sure you want to reset sync storage to default values?")) {
                    chrome.storage.sync.clear();
                    alert("Sync storage has been cleared!");
                    window.location.reload(true);
                }
                break;
            default:
                alert('PPM2 - I do not understand this command: "' + cmd + '"');
                break;
        }
    });

});

