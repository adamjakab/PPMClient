define([
        'angular',
        'states/noprofile/dependencies'
],
function(angular) {
    var module = angular.module('optionsApp');

    module.config(function($stateProvider) {
        $stateProvider
            .state('noprofile', {
                url: '/noprofile',
                controller: 'noprofile.controller',
                templateUrl: 'options/states/noprofile/noprofile.html'
            }
        );
    });
});