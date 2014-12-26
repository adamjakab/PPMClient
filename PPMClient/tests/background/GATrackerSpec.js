/**
 * GATracker Tests
 */
define(['TestUtils', 'GATracker'],
    function (TestUtils, GATracker) {

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
