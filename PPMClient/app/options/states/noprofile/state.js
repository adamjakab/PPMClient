define([
    'vendor/stateDependencyResolver'
],
function(stateDependencyResolver)
{
    var module = angular.module('app');

    module.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('noprofile', {
            url: '/noprofile',
            templateUrl: 'options/states/noprofile/noprofile.html',
            resolve: stateDependencyResolver('noprofile')
        });
    });
});