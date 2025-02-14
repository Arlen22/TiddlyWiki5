/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/post-anon.js
type: application/javascript
module-type: mws-route

POST /admin/anon

\*/
(function() {

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

const route = {
  method: "POST",
  path: /^\/admin\/anon\/?$/,
  bodyFormat: "www-form-urlencoded",
  csrfDisable: true,
  handler: function(request, response, state) {
    // Check if user is authenticated and is admin
    if(!state.authenticatedUser || !state.authenticatedUser.isAdmin) {
      response.writeHead(401, "Unauthorized", { "Content-Type": "text/plain" });
      response.end("Unauthorized");
      return;
    }

    // Update the configuration tiddlers
    var wiki = $tw.wiki;
    wiki.addTiddler({
      title: "$:/config/MultiWikiServer/ShowAnonymousAccessModal",
      text: "yes"
    });

    // Redirect back to admin page
    response.writeHead(302, {"Location": "/"});
    response.end();
  }
};

module.exports = route;

}());