var fs = require('fs')
var path = require('path')
var http = require('http')
var util = require('util')
var childProcess = require('child_process')
var EventEmitter = require('events').EventEmitter
var async = require('async')
var temp = require('temp')
var phantomjs = require('phantomjs-prebuilt')
var WebSocket = require('faye-websocket')

var noop = function () {}

// PhantomJS script template.
var template = async.memoize(function (path, cb) {
  fs.readFile(path, 'utf-8', cb)
}).bind(null, path.join(__dirname, 'tmpl', 'script.js'))

// A NoFace is a handle to a PhantomJS child process.
function NoFace () {
  this.child = null
  this.channel = null
}
util.inherits(NoFace, EventEmitter)

// Send a message to PhantomJS.
NoFace.prototype.send = function (message) {
  if (!this.channel) {
    throw new Error('Channel not established')
  }
  this.channel.send(message)
}

// Close the connection to PhantomJS.
NoFace.prototype.close = function (message) {
  if (!this.channel) {
    throw new Error('Channel not established')
  }
  this.channel.close()
  this.channel = null
}

// Create a NoFace. Takes a function to execute in PhantomJS, and
// optionally any extra options to `child_process.spawn`.
module.exports = function (src, options) {
  if (typeof src === 'function') {
    src = src.toString()
  }
  if (!src.match(/^\s*function/)) {
    src = 'function (channel) {' + src + '}'
  }

  // Create a handle object.
  var ph = new NoFace()

  // Name of the temporary file containing the PhantomJS script.
  var tmpFile = temp.path({
    prefix: 'node-noface-',
    suffix: '.js'
  })

  // Build phantomjs arguments.
  var args = (options && options.args) || []
  args = args.concat(tmpFile)

  // Temporary HTTP server used to establish the channel.
  var server = http.createServer(function (req, res) {
    res.writeHead(400)
    res.end()
  })

  async.series([
    function (cb) {
      // Grab a random port, start listening.
      server.listen(0, 'localhost', cb)
    },
    function (cb) {
      // Write a script based on the template.
      template(function (err, script) {
        if (err) return cb(err)

        script = script
          .replace('PORT', server.address().port)
          .replace('SRC', src)

        fs.writeFile(tmpFile, script, cb)
      })
    },
    function (cb) {
      // Wait for a WebSocket connection.
      server.on('upgrade', function (req, sock, head) {
        // Callback only once.
        if (!cb) return

        ph.channel = new WebSocket(req, sock, head)
        ph.channel.onmessage = function (event) {
          ph.emit('message', event.data)
        }
        ph.channel.onclose = function () {
          ph.channel = null
          ph.emit('close')
        }

        cb()
        cb = null
      })

      // Spawn PhantomJS.
      ph.child = childProcess.spawn(phantomjs.path, args, options)
      ph.child.on('exit', function (code) {
        if (cb) {
          cb(new Error('PhantomJS startup failed, code ' + code))
          cb = null
        } else if (code !== 0) {
          ph.emit('error', new Error(
            'PhantomJS exited with code ' + code
          ))
        }
      })
    }
  ], function (err) {
    // No longer need the HTTP server.
    if (server) {
      server.close()
      server = null
    }

    // Clean up the temporary script file.
    fs.unlink(tmpFile, noop)

    // Emit result.
    if (err) {
      ph.emit('error', err)
    } else {
      ph.emit('open')
    }
  })

  // Return the handle.
  return ph
}
