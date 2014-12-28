define(
    [
        'app.module'
    ],
    function () {
        angular.module('popupApp').controller('app.controller',
            function ($scope, settings, $state) {
                $scope.app_name = 'Paranoia Password Manager 2';
                $scope.app_version = '1.0.0';

            }
        );
    }
);