/**
 * GATracker Tests
 */
define(['config', 'TestUtils', 'GATracker'],
    function (cfg, TestUtils, GATracker) {

        describe("GATracker Tests", function () {

            it("initialize should return Promise", function () {
                TestUtils.isPromise(GATracker.initialize());
            });

            it("shutdown should return Promise", function () {
                TestUtils.isPromise(GATracker.shutdown());
            });

        });
    }
);
