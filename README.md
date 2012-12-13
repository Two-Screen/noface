## Poltergeist [![Build Status](https://travis-ci.org/Two-Screen/poltergeist.png)](https://travis-ci.org/Two-Screen/poltergeist)

Quickly and easily start [PhantomJS] from Node.js.

    var poltergeist = require('poltergeist');

    var pg = poltergeist(function(channel) {
        // Runs within PhantomJS. (No access to closure!)
        channel.onmessage = function(event) {
            channel.send(event.data);
        };
    });

    pg.on("open", function() {
        pg.send("Hello world!");
    });

    pg.on("message", function(message) {
        pg.close();
    });

 [PhantomJS]: http://phantomjs.org/

### Installing

    npm install poltergeist

Make sure `phantomjs` is in your `PATH`.

### Synopsis

    poltergeist(src, options)

Poltergeist opens a WebSocket connection between Node.js and PhantomJS. The
`src` callback function is executed within PhantomJS on the socket `open`
event, and receives the `WebSocket` instance.

Rather than a function, it may also be a string of JavaScript code. But in
either case, note that it will not have access to closures, but will have
access to all of the PhantomJS API.

The optional parameter `options` contains any additional options to pass to
`child_process.spawn`.

By default, the PhantomJS child exits when the channel closes. Override
`channel.onclose` to change this behavior. The default error handler in
PhantomJS is also set to exit the process and emit an `error` event in
Node.js.

The return value is a `Poltergeist` instance.

##### Events

 - `open`: The PhantomJS child has started and
   the WebSocket connection is established.
 - `close`: The WebSocket connection is closed.
   By default, the PhantomJS child will automatically exit.
 - `message`: The PhantomJS child sends a message.
   Receives a string or `Buffer`.
 - `error`: Startup failed or the child did not exit cleanly.
   Receives an `Error` instance.

##### Methods

 - `send`: Send a message to the PhantomJS child.
   Accepts a string or a `Buffer`.
 - `close`: Close the WebSocket connection.
   By default, the PhantomJS child will automatically exit.

##### Properties

 - `child`:  Contains the `ChildProcess` instance from `child_process`.
 - `channel`: While the WebSocket channel is open,
   contains the `WebSocket` instance from `faye-websocket`.

### Hacking the code

    git clone https://github.com/Two-Screen/poltergeist.git
    cd poltergeist
    npm install
    npm test
