var test = require('tap').test;
var poltergeist = require('./');

function pgWithErrorHandler(t, src) {
    var pg = poltergeist(src, { stdio: [0,1,2] });
    pg.on('error', function(err) {
        t.fail('poltergeist');
    });
    return pg;
}

test('open and close from child', function(t) {
    t.plan(1);

    var pg = pgWithErrorHandler(t, function(channel) {
        channel.close();
    });
    pg.on("close", function() {
        t.pass("close from child");
    });
});

test('open and close from parent', function(t) {
    t.plan(1);

    var pg = pgWithErrorHandler(t, function(channel) {});
    pg.on("open", function() {
        pg.close();
    });
    pg.on("close", function() {
        t.pass("close from parent");
    });
});

test('messaging.', function(t) {
    t.plan(1);

    var message = "Hello world!";

    var pg = pgWithErrorHandler(t, function(channel) {
        channel.onmessage = function(event) {
            channel.send(event.data);
        };
    });
    pg.on("open", function() {
        pg.send(message);
    });
    pg.on("message", function(s) {
        t.equal(s, message, "echo test");
        pg.close();
    });
});
