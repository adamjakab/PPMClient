/** @type ParanoiaPasswordManager PPM */
var PPM = chrome.extension.getBackgroundPage().PPM;
/** @value angular AJS */
var AJS = PPM.getAngularJs();
/** @type ChromeStorage CHROMESTORAGE */
var CHROMESTORAGE = PPM.getComponent("CHROMESTORAGE");
//
var log = function(msg, type) {console.log(msg);};
//
log("initing...");
var testsApp = angular.module('testsApp', ['ui.bootstrap']);

var TestCtrl = function ($scope, $modal) {
    $scope.selected = "Nothing!"
    $scope.items = ['item1', 'item2', 'item3'];

    $scope.openModal = function () {
        log("opening..");
        var modalInstance = $modal.open({
            templateUrl: 'partials/edit_server.html',
            controller: ModalInstanceCtrl,
            resolve: {
                items: function () {
                    return $scope.items;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            log('Modal dismissed at: ' + new Date());
        });
    };
};
testsApp.controller('TestCtrl', [ '$scope', '$modal' , TestCtrl]);

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

var ModalInstanceCtrl = function ($scope, $modalInstance, items) {
    log("YOO!");
    $scope.items = items;
    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
testsApp.controller('ModalInstanceCtrl', [ '$scope', '$modalInstance', 'items' , ModalInstanceCtrl]);




//auto bootstrap AngularJS and init window
$(document).ready(function() {
    try {
        log("AngularJs version: " + angular.version.full + "("+angular.version.codeName+")");
        angular.bootstrap(document, ['testsApp']);
    } catch(e) {
        log("AngularJs is unavailable! " + e);
    }
});