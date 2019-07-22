/*\
title: $:/plugins/tiddlywiki/server-sent-events/global-var.js
type: application/javascript
module-type: global

Adds an EventEmitter class which may be used on both the server and client

\*/

(function () {

/**
 * @type {ReturnType<handleConnection>[]}
 */
var activeConnections = [];

var serverEvents = { handleConnection, activeConnections, broadcastEvent, isServer: true }

/**
 * @this {typeof serverEvents}
 * @param {string} type 
 * @param {string} data 
 */
function broadcastEvent(type, data) {
  if (typeof type !== "string") {
    throw new Error("type must be a string");
  }
  if (typeof data !== "string" || data.indexOf("\n") !== -1) {
    throw new Error("data must be a single-line string");
  }
  this.activeConnections.forEach(function (conn) {
    conn.sendEvent(type, data);
  });
}

/**
 * 
 * @this {typeof serverEvents}
 * @param {import("http").IncomingMessage} request 
 * @param {import("http").ServerResponse} response 
 * @param {ServerState} state 
 */
function handleConnection(request, response, state) {

  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  response.write("\n", "utf8");

  var connection = { request, response, state, sendEvent };

  this.activeConnections.push(connection);

  request.on("close", (function(self){ return function () {
    let index = self.activeConnections.indexOf(connection);
    if (index !== -1) self.activeConnections.splice(index, 1);
  } })(this));

  /**
   * @this {typeof connection}
   * @param {string} type The event type to send
   * @param {string} data The data to send, which must be a string with no newline characters
   */
  function sendEvent(type, data) {
    if (typeof type !== "string") {
      throw new Error("type must be a string");
    }
    if (typeof data !== "string" || data.indexOf("\n") !== -1) {
      throw new Error("data must be a single-line string");
    }
    this.response.write("event: " + type + "\n", "utf8");
    // this.response.write("id: " + type + "\n", "utf8");
    // this.response.write("retry: " + type + "\n", "utf8");
    this.response.write("data: " + data + "\n\n", "utf8");

  }

  return connection;

}
if ($tw.browser) {
  let eventsURL = location.protocol + "//" + location.host + location.pathname
    + (location.pathname.endsWith("/") ? "" : "/")
    + "status/events";
  exports.serverEvents = new EventSource(eventsURL, { withCredentials: true });
} else {
  exports.serverEvents = serverEvents;
}

})();

