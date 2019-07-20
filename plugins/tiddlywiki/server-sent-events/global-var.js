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

var serverEvents = { handleConnection, activeConnections, broadcastEvent }

function broadcastEvent(type, data) {
  if (typeof type !== "string") {
    throw new Error("type must be a string");
  }
  if (typeof data !== "string" || data.indexOf("\n") !== -1) {
    throw new Error("data must be a single-line string");
  }
  activeConnections.forEach(conn => {
    conn.sendEvent(type, data);
  });
}
serverEvents.handleConnection = handleConnection;
serverEvents.activeConnections = activeConnections;

/**
 * 
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

  activeConnections.push(connection);

  this.request.on("close", () => {
    let index = activeConnections.indexOf(conection);
    if (index !== -1) activeConnections.splice(index, 1);
  })

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

exports.serverEvents = serverEvents;

})();

