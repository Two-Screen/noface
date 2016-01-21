## No-Face [![Build Status](https://travis-ci.org/Two-Screen/noface.png)](https://travis-ci.org/Two-Screen/noface)

No-Face (from [Spirited Away]) lets you quickly and easily start [PhantomJS]
processes, and exchange data with them, from within [Node.js].

    var noface = require('noface');

    var ph = noface(function(channel) {
        // Runs within PhantomJS. (No access to closure!)
        channel.onmessage = function(event) {
            channel.send(event.data);
        };
    });

    ph.on("open", function() {
        ph.send("Hello world!");
    });

    ph.on("message", function(message) {
        ph.close();
    });

 [Spirited Away]: http://en.wikipedia.org/wiki/Spirited_Away
 [PhantomJS]: http://phantomjs.org/
 [Node.js]: http://nodejs.org/

### Installing

    npm install noface

### Synopsis

    noface(src, options)

No-Face opens a WebSocket connection between Node.js and PhantomJS. The
`src` callback function is executed within PhantomJS on the socket `open`
event, and receives the `WebSocket` instance.

Rather than a function, it may also be a string of JavaScript code. But in
either case, note that it will not have access to closures, but will have
access to all of the PhantomJS API.

The optional parameter `options` contains any additional options to pass to
`child_process.spawn`. If you include an array `args` in options, these will
be passed to the PhantomJS child.

By default, the PhantomJS child exits when the channel closes. Override
`channel.onclose` to change this behavior. The default error handler in
PhantomJS is also set to exit the process and emit an `error` event in
Node.js.

The return value is a `NoFace` instance.

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

    git clone https://github.com/Two-Screen/noface.git
    cd noface
    npm install
    npm test
