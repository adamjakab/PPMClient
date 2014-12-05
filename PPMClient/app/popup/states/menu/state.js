define([
    'lib/stateDependencyResolver'
],
function(stateDependencyResolver)
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