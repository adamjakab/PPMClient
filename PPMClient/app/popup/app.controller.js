define(['app.module'], function () {
    angular.module('app').controller('app.controller', function ($scope) {
        $scope.app_name = 'Paranoia Password Manager';
        $scope.app_version = '0.0.0.0.1';
    });
});