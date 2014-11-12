/**
 * Created by jackisback on 1/18/14.
 */
var Class2 = Class.create(Base, {
    // redefine the speak method
    say: function($super, message) {
        return $super(message) + ', yarr[2]!';
    }
});