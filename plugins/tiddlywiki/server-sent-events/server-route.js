/*\
title: $:/plugins/tiddlywiki/server-sent-events/server-route.js
type: application/javascript
module-type: route

interface Route {
  method: string;
  path: RegExp;
  handler: (request, response, state) => void;
  bodyFormat: "stream" | "string" | "buffer";
}

\*/
(function () {

exports.method = "GET";

exports.path = /^\/status\/events$/

exports.handler = handler;

exports.bodyFormat = "stream";

/**
 * 
 * @param {import("http").IncomingMessage} request 
 * @param {import("http").ServerResponse} response 
 * @param {ServerState} state 
 */
function handler(request, response, state) {
  
  if (request.headers.accept && request.headers.accept === 'text/event-stream') {
    $tw.serverEvents.handleConnection(request, response, state);
  } else {
    response.writeHead(404, {});
    response.write(JSON.stringify(request.headers.accept))
    response.end();
  }
}

})();
