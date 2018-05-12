/*\
title: $:/plugins/tiddlywiki/tiddlyweb/tiddlywebroutes.js
type: application/javascript
module-type: startup

Browser message handling

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";


// Export name and synchronous status
exports.name = "tiddlywebroutes";
exports.platforms = ["node"];
exports.before = ["commands"];
exports.synchronous = true;

exports.startup = function() {
	$tw.hooks.addHook('th-server-command-post-start', function(simpleserver, nodeserver, servertype) {
		// nodeserver and servertype are ignored
		// Add route handlers
		simpleserver.addRoute({
			method: "PUT",
			path: /^\/recipes\/default\/tiddlers\/(.+)$/,
			handler: function(request,response,state) {
				var title = decodeURIComponent(state.params[0]),
					fields = JSON.parse(state.data);
				// Pull up any subfields in the `fields` object
				if(fields.fields) {
					$tw.utils.each(fields.fields,function(field,name) {
						fields[name] = field;
					});
					delete fields.fields;
				}
				// Remove any revision field
				if(fields.revision) {
					delete fields.revision;
				}
				state.wiki.addTiddler(new $tw.Tiddler(state.wiki.getCreationFields(),fields,{title: title},state.wiki.getModificationFields()));
				var changeCount = state.wiki.getChangeCount(title).toString();
				response.writeHead(204, "OK",{
					Etag: "\"default/" + encodeURIComponent(title) + "/" + changeCount + ":\"",
					"Content-Type": "text/plain"
				});
				response.end();
			}
		});
		simpleserver.addRoute({
			method: "DELETE",
			path: /^\/bags\/default\/tiddlers\/(.+)$/,
			handler: function(request,response,state) {
				var title = decodeURIComponent(state.params[0]);
				state.wiki.deleteTiddler(title);
				response.writeHead(204, "OK", {
					"Content-Type": "text/plain"
				});
				response.end();
			}
		});
		simpleserver.addRoute({
			method: "GET",
			path: /^\/$/,
			handler: function(request,response,state) {
				response.writeHead(200, {"Content-Type": state.server.get("serveType")});
				var text = state.wiki.renderTiddler(state.server.get("renderType"),state.server.get("rootTiddler"));
				response.end(text,"utf8");
			}
		});
		simpleserver.addRoute({
			method: "GET",
			path: /^\/status$/,
			handler: function(request,response,state) {
				response.writeHead(200, {"Content-Type": "application/json"});
				var text = JSON.stringify({
					username: state.server.get("username"),
					space: {
						recipe: "default"
					},
					tiddlywiki_version: $tw.version
				});
				response.end(text,"utf8");
			}
		});
		simpleserver.addRoute({
			method: "GET",
			path: /^\/favicon.ico$/,
			handler: function(request,response,state) {
				response.writeHead(200, {"Content-Type": "image/x-icon"});
				var buffer = state.wiki.getTiddlerText("$:/favicon.ico","");
				response.end(buffer,"base64");
			}
		});
		simpleserver.addRoute({
			method: "GET",
			path: /^\/recipes\/default\/tiddlers.json$/,
			handler: function(request,response,state) {
				response.writeHead(200, {"Content-Type": "application/json"});
				var tiddlers = [];
				state.wiki.forEachTiddler({sortField: "title"},function(title,tiddler) {
					var tiddlerFields = {};
					$tw.utils.each(tiddler.fields,function(field,name) {
						if(name !== "text") {
							tiddlerFields[name] = tiddler.getFieldString(name);
						}
					});
					tiddlerFields.revision = state.wiki.getChangeCount(title);
					tiddlerFields.type = tiddlerFields.type || "text/vnd.tiddlywiki";
					tiddlers.push(tiddlerFields);
				});
				var text = JSON.stringify(tiddlers);
				response.end(text,"utf8");
			}
		});
		simpleserver.addRoute({
			method: "GET",
			path: /^\/recipes\/default\/tiddlers\/(.+)$/,
			handler: function(request,response,state) {
				var title = decodeURIComponent(state.params[0]),
					tiddler = state.wiki.getTiddler(title),
					tiddlerFields = {},
					knownFields = [
						"bag", "created", "creator", "modified", "modifier", "permissions", "recipe", "revision", "tags", "text", "title", "type", "uri"
					];
				if(tiddler) {
					$tw.utils.each(tiddler.fields,function(field,name) {
						var value = tiddler.getFieldString(name);
						if(knownFields.indexOf(name) !== -1) {
							tiddlerFields[name] = value;
						} else {
							tiddlerFields.fields = tiddlerFields.fields || {};
							tiddlerFields.fields[name] = value;
						}
					});
					tiddlerFields.revision = state.wiki.getChangeCount(title);
					tiddlerFields.type = tiddlerFields.type || "text/vnd.tiddlywiki";
					response.writeHead(200, {"Content-Type": "application/json"});
					response.end(JSON.stringify(tiddlerFields),"utf8");
				} else {
					response.writeHead(404);
					response.end();
				}
			}
		});
	});
}

})();
