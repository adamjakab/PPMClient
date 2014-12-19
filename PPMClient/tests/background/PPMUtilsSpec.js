/**
 * PPMUtils Tests
 */
define(['config', 'PPMUtils'], function (cfg, PPMUtils) {
    describe("PPMUtils Tests", function() {

        //disable console logging on PPMLogger
        //cfg.set("sync.logger.do_console_logging", false);

        it("initialize should return Promise", function() {
            var ret = PPMUtils.initialize();
            expect(ret.then).toBeDefined();
            expect(ret.error).toBeDefined();
            expect(ret.catch).toBeDefined();
        });

        it("shutdown should return Promise", function() {
            var ret = PPMUtils.shutdown();
            expect(ret.then).toBeDefined();
            expect(ret.error).toBeDefined();
            expect(ret.catch).toBeDefined();
        });

    });
});
