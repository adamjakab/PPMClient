/**
 * PPMCryptor Tests
 */
define(['config', 'TestUtils', 'PPMCryptor', 'PPMUtils'],
    function (cfg, TestUtils, PPMCryptor, PPMUtils) {

        describe("PPMCryptor Main", function () {
            it("should return Promise on initialize", function () {
                TestUtils.isPromise(PPMCryptor.initialize());
            });

            it("should return Promise on shutdown", function () {
                TestUtils.isPromise(PPMCryptor.shutdown());
            });
        });

        describe("PPMCryptor Hasher", function () {
            var testString = "I had one but the wheels fell off!";
            var testKey = "85781829968fe5d680a0da14224816e6";

            it("should always return the same md5 hash", function () {
                var hash1 = PPMCryptor.md5hash(testString);
                var hash2 = PPMCryptor.md5hash(testString);
                expect(hash1.length).toBe(32);
                expect(hash2.length).toBe(32);
                expect(hash1).toBe(hash2);
            });

            it("should always return the same md5(hmac) hash", function () {
                var hash1 = PPMCryptor.md5hash(testString, testKey);
                var hash2 = PPMCryptor.md5hash(testString, testKey);
                expect(hash1.length).toBe(32);
                expect(hash2.length).toBe(32);
                expect(hash1).toBe(hash2);
            });

            it("should always return the same sha3 hash", function () {
                var hash1 = PPMCryptor.sha3Hash(testString);
                var hash2 = PPMCryptor.sha3Hash(testString);
                expect(hash1.length).toBe(64);
                expect(hash2.length).toBe(64);
                expect(hash1).toBe(hash2);
            });
        });


        describe("PPMCryptor Cipher", function () {
            var testString = "I had one but the wheels fell off!";
            var testKey = "85781829968fe5d680a0da14224816e6";

            it("should always produce different ciphers for same string", function () {
                var cipher = PPMCryptor.encryptAES(testString, testKey);
                var cipher2 = PPMCryptor.encryptAES(testString, testKey);
                expect(cipher != cipher2).toBeTruthy();
            });

            it("should always decrypt to the original string", function () {
                for (var i=0; i<10; i++) {
                    var testString = PPMUtils.getGibberish(1, 1024);
                    var testKey = PPMUtils.getGibberish(1, 256);
                    var cipher = PPMCryptor.encryptAES(testString, testKey);
                    var deciphered = PPMCryptor.decryptAES(cipher, testKey);
                    expect(deciphered).toBe(testString);
                }
            });


        });
    }
);
