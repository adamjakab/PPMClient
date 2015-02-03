/**
 * PPM default configuration for Chrome local storage
 * When this will be implemented these will be used for user interface preferences
 * such as active tab, table ordering, filters, etc
 */
define(['ConfigurationManager'],
    /**
     * @param ConfigurationManager
     * @return {ConfigurationManager}
     */
    function (ConfigurationManager) {
        return new ConfigurationManager(
            {

            }
        );
    }
);
