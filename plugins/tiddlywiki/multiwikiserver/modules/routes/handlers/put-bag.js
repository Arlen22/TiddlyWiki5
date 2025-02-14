/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/put-bag.js
type: application/javascript
module-type: mws-route

PUT /bags/:bag_name

\*/
(function() {

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

const route = {
	method: "PUT",
	path: /^\/bags\/(.+)$/,
	useACL: true,
	entityName: "bag",
	handler: function(request,response,state) {
		// Get the  parameters
		var bag_name = $tw.utils.decodeURIComponentSafe(state.params[0]),
			data = $tw.utils.parseJSONSafe(state.data);
		if(bag_name && data) {
			var result = $tw.mws.store.createBag(bag_name,data.description);
			if(!result) {
				state.sendResponse(204,{
					"Content-Type": "text/plain"
				});
			} else {
				state.sendResponse(400,{
					"Content-Type": "text/plain"
				},
				result.message,
				"utf8");
			}
		} else {
			if(!response.headersSent) {
				response.writeHead(404);
				response.end();
			}
		}
	}
};

module.exports = route;

}());
