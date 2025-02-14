/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/post-bag.js
type: application/javascript
module-type: mws-route

POST /bags

Parameters:

bag_name
description

\*/
(function() {

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

const route = {
	method: "POST",
	path: /^\/bags$/,
	bodyFormat: "www-form-urlencoded",
	csrfDisable: true,
	useACL: true,
	entityName: "bag",
	handler: function(request,response,state) {
		if(state.data.bag_name) {
			const result = $tw.mws.store.createBag(state.data.bag_name,state.data.description);
			if(!result) {
				state.sendResponse(302,{
					"Content-Type": "text/plain",
					"Location": "/"
				});
			} else {
				state.sendResponse(400,{
					"Content-Type": "text/plain"
				},
				result.message,
				"utf8");
			}
		} else {
			state.sendResponse(400,{
				"Content-Type": "text/plain"
			});
		}
	}
};

module.exports = route;

}());
