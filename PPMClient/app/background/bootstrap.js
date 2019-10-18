/**
 * Main background application
 */
require(['ParanoiaPasswordManager'],
    function (PPM) {
        /**
         * Exposes ParanoiaPasswordManager variable for popup/options:
         * chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
         */
        window.ParanoiaPasswordManager = PPM;

        /**
         * Start/restart the application
         */
        let restartApplication = function () {
            PPM.initialize().catch(function (e) {
                console.error(e);
                window.location.reload();
            });
        };

        // Autostart
        restartApplication();


        // Omnibox commands
        chrome.omnibox.onInputEntered.addListener(function (cmd) {
            switch (cmd) {
                case "help":
                    alert("You can use one of the following commands: resetLocalStorage, resetSyncStorage");
                    break;
                case "resetLocalStorage":
                    if (confirm("Are you sure you want to reset local storage to default values?")) {
                        chrome.storage.local.clear();
                        alert("Local storage has been cleared!");
                        window.location.reload();
                    }
                    break;
                case "resetSyncStorage":
                    if (confirm("Are you sure you want to reset sync storage to default values?")) {
                        chrome.storage.sync.clear();
                        alert("Sync storage has been cleared!");
                        window.location.reload();
                    }
                    break;
                default:
                    alert('PPM2 - I do not understand this command: "' + cmd + '"');
                    break;
            }
        });
    });

