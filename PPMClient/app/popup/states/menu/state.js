define([
        'angular',
        'states/menu/dependencies'
],
function(angular) {
    var module = angular.module('popupApp');

    module.config(function($stateProvider) {
        $stateProvider
            .state('menu', {
                url: '/menu',
                templateUrl: 'popup/states/menu/menu.html'
            }
        );
    });
});