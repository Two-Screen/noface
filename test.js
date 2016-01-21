var test = require('tap').test;
var noface = require('./');

function wrap(t, src) {
    var ph = noface(src, { stdio: [0,1,2] });
    ph.on('error', function(err) {
        t.fail('noface');
    });
    return ph;
}

test('open and close from child', function(t) {
    t.plan(1);

    var ph = wrap(t, function(channel) {
        channel.close();
    });
    ph.on("close", function() {
        t.pass("close from child");
    });
});

test('open and close from parent', function(t) {
    t.plan(1);

    var ph = wrap(t, function(channel) {});
    ph.on("open", function() {
        process.nextTick(function() {
            ph.close();
        });
    });
    ph.on("close", function() {
        t.pass("close from parent");
    });
});

test('messaging', function(t) {
    t.plan(1);

    var message = "Hello world!";

    var ph = wrap(t, function(channel) {
        channel.onmessage = function(event) {
            channel.send(event.data);
        };
    });
    ph.on("open", function() {
        ph.send(message);
    });
    ph.on("message", function(s) {
        t.equal(s, message, "echo test");
        ph.close();
    });
});
