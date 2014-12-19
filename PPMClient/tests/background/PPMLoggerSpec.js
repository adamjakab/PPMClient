/**
 * PPMLogger Tests
 */
define(['config', 'PPMLogger'], function (cfg, PPMLogger) {
    describe("PPMLogger Tests", function() {

        //disable console logging on PPMLogger
        cfg.set("sync.logger.do_console_logging", false);

        it("should have empty log on startup", function() {
            expect(PPMLogger.getLogObjects().length).toEqual(0);
        });

        it("should not exceed maximum config size", function() {
            var maxLogsObjects = cfg.get("sync.logger.log_objects_to_keep");
            for(var i=1; i<=(maxLogsObjects+10); i++) {
                PPMLogger.log("test-"+i, "Test", "info");
                expect(PPMLogger.getLogObjects().length).toEqual((i<maxLogsObjects?i:maxLogsObjects));
            }
        });

        it("should clean logs", function() {
            PPMLogger.resetLogObjects();
            expect(PPMLogger.getLogObjects().length).toEqual(0);
        });

        it("should contain logged string", function() {
            PPMLogger.log("ciao", "TEST");
            var logObjects = PPMLogger.getLogObjects();
            var lastLogObject = logObjects.pop();
            expect(lastLogObject.index).toEqual(0);
            expect(lastLogObject.zone).toEqual("TEST");
            expect(lastLogObject.msg).toEqual("ciao");
            expect(lastLogObject.type).toEqual("log");
            console.log(JSON.stringify(lastLogObject));
        });

    });
});
