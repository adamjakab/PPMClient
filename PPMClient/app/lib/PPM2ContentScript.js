(function() {

    var init = function() {
        if(!chrome.extension.onMessage.hasListener(messageListener)) {
            chrome.extension.onMessage.addListener(messageListener);
        }
        log("READY");
    };


    var messageListener = function(data, sender, sendResponse) {
        //log("sender: " + sender.id);
        if(data && data.type) {
            if(data.type=="LOGIN_PASSWORD_FILL") {
                loginPasswordFill(data);
            }
        } else {
            log("Data type is missing!");
        }
    };



    var log = function(msg) {
        var ts = Date.now();
        var prefix = 'PPM2(ContentScript)' + "[" + ts + "]";
        prefix += ": ";
        console.log(prefix + msg);
    };

    init();
})();