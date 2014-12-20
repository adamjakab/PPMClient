define([
        'angular',
        'states/noprofile/dependencies'
],
function(angular) {
    var module = angular.module('app');

    module.config(function($stateProvider) {
        $stateProvider
            .state('noprofile', {
                url: '/noprofile',
                templateUrl: 'options/states/noprofile/noprofile.html'
            }
        );
    });
});