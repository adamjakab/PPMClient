define([
    'vendor/stateDependencyResolver'
],
function(stateDependencyResolver)
{
    var module = angular.module('app');

    module.config(function($stateProvider, $urlRouterProvider) {
        //any unmatched url will go to info state
        $urlRouterProvider.otherwise("/info");

        $stateProvider.state('info', {
            url: '/info',
            templateUrl: 'options/states/info/info.html',
            resolve: stateDependencyResolver('info')
        });
    });
});