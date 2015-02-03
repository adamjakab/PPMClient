define([
        'angular',
        'states/encryptionscheme/dependencies'
],
function(angular) {
    var module = angular.module('App');

    module.config(function($stateProvider, $urlRouterProvider) {
        //any unmatched url will go to info state
        $urlRouterProvider.otherwise("/encryptionscheme");

        $stateProvider
            .state('encryptionscheme', {
                url: '/encryptionscheme',
                controller: 'encryptionscheme.controller',
                templateUrl: 'options/states/encryptionscheme/encryptionscheme.html'
            }
        );
    });
});