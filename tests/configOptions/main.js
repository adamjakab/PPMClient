console.log("RUNNING...");


var cfg = new ConfigOptions({
    "a":1,
    "b":2,
    "c":{"ping":500,"pong":1000}
}, console.log.bind(console));



cfg.merge({
    a: "changed",
    d: ["a","b","c"],
    u: {
        mmm: "yops"
    }
});

cfg.set("u.mmm", undefined);

//dump
console.log(JSON.stringify(cfg.getRecursiveOptions(true)));







