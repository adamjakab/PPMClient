/**
 * ServerConcentrator Tests
 */
define(['TestUtils', 'ServerConcentrator'],
    function (TestUtils, ServerConcentrator) {

        describe("ServerConcentrator Tests", function () {

            it("initialize should return Promise", function () {
                TestUtils.isPromise(ServerConcentrator.initialize());
            });

            it("shutdown should return Promise", function () {
                TestUtils.isPromise(ServerConcentrator.shutdown());
            });

        });
    }
);
