define([
        'angular',
        'states/passcard/dependencies'
],
function(angular) {
    var module = angular.module('optionsApp');

    module.config(function($stateProvider) {
        $stateProvider
            .state('passcard', {
                url: '/passcard',
                controller: 'passcard.controller',
                templateUrl: 'options/states/passcard/passcard.html'
            }
        );
    });
});