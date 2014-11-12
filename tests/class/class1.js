/**
 * Created by jackisback on 1/18/14.
 */
var Class1 = Class.create(Base, {
    /**
     *
     * @param [$super]
     * @param message
     * @returns {string}
     */
    say: function($super, message) {
        return $super(message) + ', yarr[1]!';
    },
    /**
     *
     * @param [$super]
     * @param msg
     */
    log: function($super, msg) {
        $super(msg + ', yarr[1]');
    }
});