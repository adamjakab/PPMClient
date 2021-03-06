define([
        'angular',
        'states/menu/dependencies'
],
function(angular) {
    var module = angular.module('App');

    module.config(function($stateProvider) {
        $stateProvider
            .state('menu', {
                url: '/menu',
                controller: 'menu.controller',
                templateUrl: 'popup/states/menu/menu.html'
            }
        );
    });
});