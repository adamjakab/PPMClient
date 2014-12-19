/**
 * PPMUtils Tests
 */
define(['config', 'TestUtils', 'PPMUtils'],
    function (cfg, TestUtils, PPMUtils) {

        describe("PPMUtils Tests", function () {

            it("should return Promise on initialize", function () {
                TestUtils.isPromise(PPMUtils.initialize());
            });

            it("should return Promise on shutdown", function () {
                TestUtils.isPromise(PPMUtils.shutdown());
            });

            it("should return random number in range", function () {
                var random;
                var min = 0; var max = 64;
                for (var i=0; i<100; i++) {
                    random = PPMUtils.getRandomNumberInRange(min,max);
                    expect(random).toBeGreaterThan(min-1);
                    expect(random).toBeLessThan(max+1);
                }
            });

            it("should return gibberish string with exact length", function () {
                var min = 0; var max = 64;
                for (var i=0; i<100; i++) {
                    var useSpecial = (i%2);
                    var random = PPMUtils.getRandomNumberInRange(min,max);
                    var gibberish = PPMUtils.getGibberish(random, random, useSpecial);
                    expect(gibberish.length).toBe(random);
                }
            });

            it("should return gibberish string with length between min and max", function () {
                var min = 0; var max = 32;
                for (var i=0; i<100; i++) {
                    var useSpecial = (i%2);
                    var gibberish = PPMUtils.getGibberish(min, max, useSpecial);
                    expect(gibberish.length).toBeGreaterThan(min-1);
                    expect(gibberish.length).toBeLessThan(max+1);
                }
            });


        });
    }
);
