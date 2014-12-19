/**
 * PPMUtils Tests
 */
define(['config', 'TestUtils', 'PPMUtils'],
    function (cfg, TestUtils, PPMUtils) {

        describe("PPMUtils Tests", function () {

            it("initialize should return Promise", function () {
                TestUtils.isPromise(PPMUtils.initialize());
            });

            it("shutdown should return Promise", function () {
                TestUtils.isPromise(PPMUtils.shutdown());
            });

        });
    }
);
