requirejs.config({
    baseUrl: '../js',
    paths: {
        underscore: '../bower/underscore/underscore',
        bluebird: '../bower/bluebird/js/browser/bluebird'
    },
    shim: {

    }
});

require(['app/ParanoiaPasswordManager'], function(PPM) {
    console.log("IN");
    //PPM.t1();
});

