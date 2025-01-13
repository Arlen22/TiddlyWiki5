/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/delete-bag-tiddler.js
type: application/javascript
module-type: mws-route

DELETE /bags/:bag_name/tiddler/:title

\*/
(function() {

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var aclMiddleware = require("$:/plugins/tiddlywiki/multiwikiserver/routes/helpers/acl-middleware.js").middleware;

exports.method = "DELETE";

exports.path = /^\/bags\/([^\/]+)\/tiddlers\/(.+)$/;
/** @type {ServerRouteHandler<2>} */	
exports.handler = async function(request,response,state) {
	await aclMiddleware(request, response, state, "bag", "WRITE");
	if(response.headersSent) return;
	// Get the  parameters
	var bag_name = $tw.utils.decodeURIComponentSafe(state.params[0]),
		title = $tw.utils.decodeURIComponentSafe(state.params[1]);
	if(bag_name) {
		if(!response.headersSent) {
			var result = await state.store.deleteTiddler(title,bag_name);
			response.writeHead(204, "OK", {
				"X-Revision-Number": result.tiddler_id.toString(),
				Etag: state.makeTiddlerEtag(result),
				"Content-Type": "text/plain"
			});
			response.end();	
		}
	} else {
		if(!response.headersSent) {
			response.writeHead(404);
			response.end();
		}
	}
};

}());
