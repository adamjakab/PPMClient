define(['app.module'], function() {
    angular.module('App').controller('app.controller', function($scope) {
        $scope.app_name = 'Paranoia Password Manager 2';
        $scope.app_version = '1.0.0';
    });
});