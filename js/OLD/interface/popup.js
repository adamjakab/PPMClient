/** @type ParanoiaPasswordManager PPM */
var PPM = chrome.extension.getBackgroundPage().PPM;
/** @type angular AJS */
var AJS = PPM.getAngularJs();
/** @type ChromeStorage CHROMESTORAGE */
var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
/** @type PPMStorage PPMSTORAGE */
var PPMSTORAGE = PPM.getComponent("PPMSTORAGE");
/** @type PPMUtils UTILS */
var UTILS = PPM.getComponent("UTILS");
//
var log = function(msg, type) {PPM.getComponent("LOGGER").log(msg, "Popup", type);};
//
log("initing...["+(CHROMESTORAGE.isInited()?"LOGGED IN":"NOT LOGGED")+"]");
var popupApp = AJS.module('popupApp', []);


popupApp.controller('PopupCtrl', [ '$scope',
    function ($scope) {
        $scope.has_alert_message = false;
        $scope.user_logged_in = CHROMESTORAGE.isInited();
        $scope.masterKey = "Paranoia";
        $scope.profile = "DEFAULT";
        $scope.profiles = CHROMESTORAGE.getAvailableProfiles();//["DEFAULT", "Profile-1", "Profile-2"];
        $scope.passCards = [{id:1, name:"PC1"},{id:2, name:"PC2"}];

        /*VISIBILITY CONDITIONS FOR THE THREE MAIN PANELS*/
        $scope.alertMessageVisible = function() {
            return($scope.has_alert_message);
        };
        $scope.loginPanelVisible = function() {
            return(!$scope.user_logged_in && !$scope.has_alert_message);
        };
        $scope.menuPanelVisible = function() {
            return($scope.user_logged_in && !$scope.has_alert_message);
        };


        $scope.login = function() {
            window.close();//close popup
            PPM.reInit($scope.profile, $scope.masterKey, function() {
                log("LOGIN DONE!");
                $scope.masterKey = "";
                $scope.user_logged_in = CHROMESTORAGE.isInited();
                $scope.$apply();
            });
        };

        $scope.logoutConfirm = function() {
            log("called: LOGOUT-CONFIRM");
            $scope.alert_message_title = "LOGOUT";
            $scope.alert_message_text = "Are you sure you want to log out?";
            $scope.alert_message_button_1 = "Logout";
            $scope.alert_message_button_1_action = "logout";
            $scope.alert_message_button_2 = "Cancel";
            $scope.has_alert_message = true;
        };
        $scope.logout = function() {
            log("called: LOGOUT!!!");
            window.close();//close popup
            UTILS.findAndCloseConfigurationTab(function() {
                PPM.shutdown(function() {
                    log("LOGOUT COMPLETED!");
                    $scope.resetAlertProps();
                    $scope.user_logged_in = CHROMESTORAGE.isInited();
                    $scope.$apply();
                });
            });
        };

        $scope.executeAlertAction = function(actionName) {
            log("calling alertAction: " + actionName);
            switch(actionName) {
                case "close":
                    $scope.resetAlertProps();
                    break;
                case "logout":
                    $scope.logout();
                    break;
                default:
                    log("There is no alertAction defined with this name: " + actionName);
            }
        };
        $scope.resetAlertProps = function() {
            $scope.has_alert_message = false;
            $scope.alert_message_title = null;
            $scope.alert_message_text = null;
            $scope.alert_message_button_1 = null;
            $scope.alert_message_button_1_action = null;
            $scope.alert_message_button_2 = null;
        };



        $scope.fillInPasscard = function(pcid) {
            log("called: PASSCARD FILL: " + pcid);

        };

        $scope.newPasscard = function() {
            log("called: NEW PASSCARD");

        };

        $scope.passwordGenerator = function() {
            log("called: PWD GENERATOR");
        };

        $scope.configuration = function() {
            log("called: CONFIGURATION");
            var configPageUrl = "chrome-extension://"+chrome.runtime.id+"/html/options.html";
            chrome.tabs.query({url:configPageUrl}, function(tabs) {
                if (tabs.length) {
                    var tab = tabs[0];
                    chrome.windows.getCurrent({populate:false}, function(win) {
                        if(tab.windowId == win.id) {
                            chrome.tabs.update(tab.id, {url: 'html/options.html', active: true}, function(tab){
                                window.close();//close popup
                            });
                        } else {
                            chrome.tabs.move(tab.id, {windowId: win.id, index:-1}, function(tab) {
                                chrome.tabs.update(tab.id, {url: 'html/options.html', active: true}, function(tab){
                                    window.close();//close popup
                                });
                            });
                        }
                    });
                } else {
                    chrome.tabs.create({url: 'html/options.html'}, function(tab){
                        window.close();//close popup
                    });
                }
            });
        };

        $scope.info = function() {
            log("called: INFO");
        };



    }//end of controller
]);



//auto bootstrap AngularJS and init window
$(document).ready(function() {
    try {
        log("AngularJs version: " + AJS.version.full + "("+AJS.version.codeName+")");
        AJS.bootstrap(document, ['popupApp']);
    } catch(e) {
        log("AngularJs is unavailable! " + e);
    }
});

