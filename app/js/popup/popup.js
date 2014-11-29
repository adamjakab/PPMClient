/**
 * Popup application
 */
requirejs.config({
    baseUrl: '../',
    paths: {
        underscore: '../../vendor/js/underscore',
        bluebird: '../../vendor/js/bluebird'
    },
    shim: {

    },
    deps: []
});

require(['underscore'], function(_) {
    console.log("POPUP");
    //todo: get angular from background
    var AJS = chrome.extension.getBackgroundPage().angular;
    try {
        console.log("AngularJs version: " + AJS.version.full + "("+AJS.version.codeName+")");
        //AJS.bootstrap(document, ['popupApp']);
    } catch(e) {
        console.log("AngularJs is unavailable! " + e);
    }
});