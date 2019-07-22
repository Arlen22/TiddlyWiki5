/*\
title: $:/plugins/tiddlywiki/server-sent-events/edit-watcher.js
type: application/javascript
module-type: startup
 
Command processing
 
\*/
(function () {
// console.log("test");

exports.name = "edit-watcher";
// exports.platforms = ["browser", "node"]; 
exports.after = ["load-modules", "startup"];
exports.synchronous = true;

exports.startup = function () {
  console.log("isServer", $tw.serverEvents.isServer);
  if ($tw.serverEvents.isServer) {
    $tw.wiki.addEventListener("change", function (changes) {
      let res = {};
      Object.keys(changes).forEach(function (k) { res[k] = changes[k].deleted ? "deleted" : "modified" });
      console.log("broadcastEvent server-refresh", res);
      $tw.serverEvents.broadcastEvent('server-refresh', JSON.stringify(res));
    });
  } else {
    $tw.serverEvents.addEventListener("server-refresh",/** @param {MessageEvent} msg */ function serverRefresh(msg) {
      // console.log(msg);
      var changes = JSON.parse(msg.data);
      var filteredChanges = $tw.syncer.filterFn.call(this.wiki, function (callback) {
        Object.keys(changes).forEach(function (title) {
          callback($tw.syncer.wiki.getTiddler(title), title);
        })
      });
      filteredChanges.forEach(function (title) {
        if (changes[title] === "deleted" && $tw.syncer.tiddlerInfo[title]) {
          //This could delete a newly created tiddler with the same name on the server
          //since the syncer will try deleting it from the server again.
          $tw.wiki.deleteTiddler(title);
          // So we delete the sync task before it can be processed. 
          delete $tw.syncer.taskQueue[title];
        }
      });
      $tw.syncer.syncFromServer();
    }
    );
  }
}

})();
