/**
 * PPMLogger Tests
 */
define(['config', 'PPMLogger'], function (cfg, PPMLogger) {
    describe("PPMLogger Tests", function() {

        it("should clean logs", function() {
            PPMLogger.resetLogObjects();
            expect(PPMLogger.getLogObjects().length).toEqual(0);
        });

        it("should not exceed maximum config size", function() {
            PPMLogger.resetLogObjects();
            var maxLogsObjects = cfg.get("sync.logger.log_objects_to_keep");
            for(var i=1; i<=(maxLogsObjects+10); i++) {
                PPMLogger.log("test-"+i, "Test", "info");
                expect(PPMLogger.getLogObjects().length).toEqual((i<maxLogsObjects?i:maxLogsObjects));
            }
        });

        it("should contain logged message in zone", function() {
            var message = "testMessage";
            var logZone = "TestZone";
            PPMLogger.resetLogObjects();
            PPMLogger.log(message, logZone);
            var lastLogObject = PPMLogger.getLogObjects().pop();
            expect(lastLogObject.zone).toEqual(logZone);
            expect(lastLogObject.msg).toEqual(message);
        });

        it("should match log types", function() {
            var message = "testMessage";
            var logZone = "TestZone";
            var logTypes = ["error","warning","info","log", null,"unknown"];
            var expectedTypes = ["error","warning","info","log","log","log"];
            PPMLogger.resetLogObjects();
            for(var i=0; i<logTypes.length; i++) {
                PPMLogger.log(message, logZone, logTypes[i]);
                var lastLogObject = PPMLogger.getLogObjects().pop();
                //console.log(JSON.stringify(lastLogObject));
                expect(lastLogObject.type).toEqual(expectedTypes[i]);
            }
        });

        it("should log to console", function() {
            console.log = jasmine.createSpy("log");
            console.info = jasmine.createSpy("info");
            console.warn = jasmine.createSpy("warn");
            console.error = jasmine.createSpy("error");
            //
            cfg.set("sync.logger.do_console_logging", true);//enable console logging
            var message = "testMessage";
            var logZone = "TestZone";
            //test console.log
            PPMLogger.log(message, logZone, 'log');
            expect(console.log).toHaveBeenCalled();
            //test console.info
            PPMLogger.log(message, logZone, 'info');
            expect(console.info).toHaveBeenCalled();
            //test console.warn
            PPMLogger.log(message, logZone, 'warning');
            expect(console.warn).toHaveBeenCalled();
            //test console.error
            PPMLogger.log(message, logZone, 'error');
            expect(console.error).toHaveBeenCalled();
            //
            cfg.set("sync.logger.do_console_logging", false);//disable console logging
        });

    });
});
