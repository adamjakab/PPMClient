define([
        'angular',
        'states/passcard/dependencies'
],
function(angular) {
    var module = angular.module('app');

    module.config(function($stateProvider) {
        $stateProvider
            .state('passcard', {
                url: '/passcard',
                templateUrl: 'options/states/passcard/passcard.html'
            }
        );
    });
});