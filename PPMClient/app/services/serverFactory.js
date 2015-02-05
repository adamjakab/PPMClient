define([
    'angular',
    'underscore'
], function (angular, _) {
    angular.module('App').factory('serverFactory', function() {
        var PPM = chrome.extension.getBackgroundPage().ParanoiaPasswordManager;
        var SERVERCONCENTRATOR = PPM.getComponent("SERVERCONCENTRATOR");

        return {
            getServers: function() {
                var servers = {};
                var serverIndexes = SERVERCONCENTRATOR.getRegisteredServerNames();
                for (var i=0; i<serverIndexes.length; i++) {
                    var index = serverIndexes[i];
                    var server = {index: index};
                    server = _.extend(server, SERVERCONCENTRATOR.getServerStateByIndex(index));
                    server = _.extend(server, SERVERCONCENTRATOR.getServerConfigurationByIndex(index));
                    servers[index] = server;
                }
                return servers;
            }
        };
    });
});
