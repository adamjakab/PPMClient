/**
 * USES UI-BOOTSTRAP: http://angular-ui.github.io/bootstrap/
 */

/** @type ParanoiaPasswordManager PPM */
var PPM = chrome.extension.getBackgroundPage().PPM;
/** @type ChromeStorage CHROMESTORAGE */
var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
/** @type PPMStorage PPMSTORAGE */
var PPMSTORAGE = PPM.getComponent("PPMSTORAGE");
/** @type PPMLogger LOGGER */
var LOGGER = PPM.getComponent("LOGGER");
//
var log = function(msg, type) {LOGGER.log(msg, "Options", type);};
//
log("initing...");
var optionsApp = angular.module('optionsApp', ['ui.bootstrap']);


optionsApp.controller('OptionsCtrl', [ '$scope', '$modal', '$timeout',
    function ($scope, $modal, $timeout) {

        /**
         * --------------------------------------------------------------------------------------------------TABS
         */
        $scope.tab_last_sel = CHROMESTORAGE.getOption("local", "options.last_selected_tab");
        $scope.tabs = {passcards: false, servers: false, options: false, logs: false}
        $scope.tabs[$scope.tab_last_sel] = true;
        $scope.tabSelection = function(tabName) {
            //log("SELECTED TAB: " + tabName);
            CHROMESTORAGE.setOption("local", "options.last_selected_tab", tabName);
        };


        /**
         * --------------------------------------------------------------------------------------------------PASSCARDS
         */


        /**
         * --------------------------------------------------------------------------------------------------SERVERS
         * "srv":{"0":{"name":"Paranoia Testing Server","type":"master","url":"http://localhost:8888","username":"your-user-name","password":"(:-very_secure_password-:)","ping_interval":300,"master_key":"Paranoia","index":"0"}}
         */
        $scope.serversCfgData = CHROMESTORAGE.getOption("sync", "srv");
        $scope.currSrvIndex = null;
        $scope.currSrv = null;
        $scope.PPMServerStates = [];
        $scope.numberOfServers = PPMSTORAGE.getNumberOfRegisteredServers();
        for(var i=0; i<$scope.numberOfServers; i++) {
            $scope.PPMServerStates[i] = PPMSTORAGE.getServerByIndex(i).getStateData();
        }


        //getServerByIndex

        $scope.server_edit = function(index) {
            $scope.currSrvIndex = index;
            $scope.currSrv = angular.copy($scope.serversCfgData[$scope.currSrvIndex]);
            log("Editing server["+$scope.currSrvIndex+"]..." + $scope.currSrv.name);
            var modalInstance = $modal.open({
                templateUrl: 'partials/edit_server.html',
                controller: ServerEditCtrl,
                backdrop: 'static',
                resolve: {
                    server: function () {
                        return $scope.currSrv;
                    }
                }
            });

            modalInstance.result.then(function (server) {
                //Promise resolved
                log("Saving Server Data: " + JSON.stringify(server));
                //todo: check data
                //$scope.serversCfgData[$scope.currSrvIndex] = server;
                //todo: CHROMESTORAGE.setServerData does not exist anymore!!!
                CHROMESTORAGE.setServerData($scope.currSrvIndex, "name", server.name);
                CHROMESTORAGE.setServerData($scope.currSrvIndex, "type", server.type);
                CHROMESTORAGE.setServerData($scope.currSrvIndex, "url", server.url);
                CHROMESTORAGE.setServerData($scope.currSrvIndex, "username", server.username);
                CHROMESTORAGE.setServerData($scope.currSrvIndex, "password", server.password);
                CHROMESTORAGE.setServerData($scope.currSrvIndex, "master_key", server.master_key);
                CHROMESTORAGE.setServerData($scope.currSrvIndex, "ping_interval", server.ping_interval);
                //reload serversCfgData from ChromeStorageSync
                $scope.serversCfgData = CHROMESTORAGE.getOption("sync", "srv");

            }, function () {
                //Promise rejected
                log('Server mods canceled!');
            });
        };

        $scope.server_delete = function(index) {
            //todo: ask confirmation for this
            $scope.currSrvIndex = index;
            $scope.currSrv = angular.copy($scope.serversCfgData[$scope.currSrvIndex]);
            log("Deleting server["+$scope.currSrvIndex+"]..." + $scope.currSrv.name);
        };

        $scope.server_disconnect = function(index) {
            //todo: ask confirmation for this
            /** @type ParanoiaServer server */
            var server = PPMSTORAGE.getServerByIndex(index);
            server.disconnect(function() {
                log("SRV DISCONNECTION DONE");
                $scope.PPMServerStates[index] = PPMSTORAGE.getServerByIndex(index).getStateData();
            });
        };

        $scope.server_connect = function(index) {
            //todo: ask confirmation for this
            /** @type ParanoiaServer server */
            var server = PPMSTORAGE.getServerByIndex(index);
            server.connect(function() {
                log("SRV CONNECTION DONE");
                $scope.PPMServerStates[index] = PPMSTORAGE.getServerByIndex(index).getStateData();
            });
        };

        /**
         * --------------------------------------------------------------------------------------------------OPTIONS
         */
        $scope.originalOptions = {};
        $scope.originalOptions.pwgen_specialchars = CHROMESTORAGE.getOption("sync", "pwgen_specialchars");
        $scope.originalOptions.passcard_default_username = CHROMESTORAGE.getOption("sync", "passcard_default_username");
        $scope.originalOptions.passcard_autofill_password = CHROMESTORAGE.getOption("sync", "passcard_autofill_password");
        $scope.editableOptions = angular.copy($scope.originalOptions);
        //


        $scope.options_save = function() {
            //PWGEN
            CHROMESTORAGE.setOption("sync", "pwgen_specialchars", $scope.editableOptions.pwgen_specialchars);
            //PASSCARD
            CHROMESTORAGE.setOption("sync", "passcard_default_username", $scope.editableOptions.passcard_default_username);
            CHROMESTORAGE.setOption("sync", "passcard_autofill_password", $scope.editableOptions.passcard_autofill_password);
        };

        /**
         * --------------------------------------------------------------------------------------------------LOGS
         */
        $scope.PPMLogs = LOGGER.logs;

        var stop;
        $scope.autorefreshLogs = function() {
            stop = $timeout(function() {
                //$scope.PPMLogs = LOGGER.logs;
                $scope.autorefreshLogs();
                //$timeout.cancel(stop);
            }, 1000);
        };
        $scope.autorefreshLogs();


    }//end of controller
]);



// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
var ServerEditCtrl = function ($scope, $modalInstance, server) {
    $scope.server = server;

    $scope.save = function () {
        $modalInstance.close($scope.server);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
optionsApp.controller('ServerEditCtrl', [ '$scope', '$modalInstance', 'items' , ServerEditCtrl]);



//auto bootstrap AngularJS and init window
$(document).ready(function() {
    try {
        log("AngularJs version: " + angular.version.full + "("+angular.version.codeName+")");
        angular.bootstrap(document, ['optionsApp']);
    } catch(e) {
        log("AngularJs is unavailable! " + e);
    }
});

