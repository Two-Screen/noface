// Set up a default error handler that exits.
phantom.onError = function(message, stack) {
    phantom.defaultErrorHandler(message, stack);
    phantom.exit(1);
};

// Open a channel to Node.js.
var channel = new WebSocket("ws://localhost:PORT/");

// Execute user script on connect.
channel.onopen = function() {
    (SRC)(channel);
};

// Exit neatly on close.
channel.onclose = function() {
    phantom.exit();
};
