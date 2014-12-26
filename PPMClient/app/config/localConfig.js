/**
 * PPM default configuration for Chrome local storage
 */
define(['ConfigurationManager'],
    /**
     * @param ConfigurationManager
     * @return {ConfigurationManager}
     */
    function (ConfigurationManager) {
        return new ConfigurationManager(
            {
                test: 123,
                test2: "ABC"
            }
        );
    }
);
