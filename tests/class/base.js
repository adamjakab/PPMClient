/**
 * Created by jackisback on 1/18/14.
 */
var Base = Class.create({
    initialize: function(name) {
        this.name = name;
    },
    say: function(message) {
        return this.name + ': ' + message;
    },
    log: function(msg) {
        console.log(this.name + ': ' + msg);
    }
});