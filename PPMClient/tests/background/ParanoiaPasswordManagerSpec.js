/**
 * ParanoiaPasswordManager Tests
 */
define(['TestUtils', 'ParanoiaPasswordManager'],
    function (TestUtils, ParanoiaPasswordManager) {

        describe("ParanoiaPasswordManager", function () {
            /*
            it("should return Promise on initialize", function () {
                TestUtils.isPromise(ParanoiaPasswordManager.initialize());
            });

            it("should return Promise on login", function () {
                TestUtils.isPromise(ParanoiaPasswordManager.login("x","y"));
            });

            it("should return Promise on logout", function () {
                TestUtils.isPromise(ParanoiaPasswordManager.logout());
            });*/

            it("should return a component or null if unknown", function () {
                expect(ParanoiaPasswordManager.getComponent("UNKNOWN") === null).toBeTruthy();
                expect(ParanoiaPasswordManager.getComponent("LOGGER") !== null).toBeTruthy();
                expect(ParanoiaPasswordManager.getComponent("UTILS") !== null).toBeTruthy();
                expect(ParanoiaPasswordManager.getComponent("CRYPTOR") !== null).toBeTruthy();
                expect(ParanoiaPasswordManager.getComponent("GAT") !== null).toBeTruthy();
                expect(ParanoiaPasswordManager.getComponent("CHROMESTORAGE") !== null).toBeTruthy();
                expect(ParanoiaPasswordManager.getComponent("SERVERCONCENTRATOR") !== null).toBeTruthy();
            });

        });
    }
);
