/**
 * PPMUtils Tests
 */
define(['config', 'bluebird', 'TestUtils', 'PPMUtils'],
    function (cfg, Promise, TestUtils, PPMUtils) {

        describe("PPMUtils Tests", function () {

            it("initialize should return Promise", function () {
                TestUtils.isPromise(PPMUtils.initialize());
            });

            it("shutdown should return Promise", function () {
                TestUtils.isPromise(PPMUtils.shutdown());
            });

        });
    });
