define([
        'angular',
        'lib/stateDependencyResolver'
],
function(angular, stateDependencyResolver)
{
    var module = angular.module('app');

    module.config(function($stateProvider) {

        $stateProvider
            .state('menu', {
                url: '/menu',
                templateUrl: 'popup/states/menu/menu.html',
                resolve: stateDependencyResolver('menu')
            }
        );

    });
});