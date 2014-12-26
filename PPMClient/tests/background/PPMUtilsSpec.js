/**
 * PPMUtils Tests
 */
define(['TestUtils', 'PPMUtils'],
    function (TestUtils, PPMUtils) {

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
                for (var i=0; i<10; i++) {
                    random = PPMUtils.getRandomNumberInRange(min,max);
                    expect(random).toBeGreaterThan(min-1);
                    expect(random).toBeLessThan(max+1);
                }
            });


            it("should return gibberish string with exact length", function () {
                var min = 0; var max = 64;
                for (var i=0; i<10; i++) {
                    var random = PPMUtils.getRandomNumberInRange(min,max);
                    var gibberish = PPMUtils.getGibberish(random, random);
                    expect(gibberish.length).toBe(random);
                }
            });

            it("should return gibberish string with length between min and max", function () {
                var min = 0; var max = 64;
                for (var i=0; i<10; i++) {
                    var gibberish = PPMUtils.getGibberish(min, max);
                    expect(gibberish.length).toBeGreaterThan(min-1);
                    expect(gibberish.length).toBeLessThan(max+1);
                }
            });

            it("should return padded string with exact length", function () {
                var testString = "85781829968fe5d680a0da14224816e6";
                var lft = 32; var rgt = 24;
                var padded = PPMUtils.leftRightPadString(testString, lft, rgt);
                expect(padded.length).toBe(testString.length+lft+rgt);
            });

            it("should return original string after removing padding", function () {
                var testString = "85781829968fe5d680a0da14224816e6";
                var lft = 32; var rgt = 24;
                var padded = PPMUtils.leftRightPadString(testString, lft, rgt);
                var unpadded = PPMUtils.leftRightTrimString(padded, lft, rgt);
                expect(unpadded).toBe(testString);
            });


        });
    }
);
