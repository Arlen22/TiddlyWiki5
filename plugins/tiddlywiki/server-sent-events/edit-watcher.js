/*\
title: $:/plugins/tiddlywiki/server-sent-events/edit-watcher.js
type: application/javascript
module-type: startup
 
Command processing
 
\*/
(function(){


exports.name = "edit-watcher";
exports.platforms = ["browser", "node"];
exports.after = ["load-modules", "startup"];
exports.synchronous = true;

exports.startup = function () {
  if ($tw.serverEvents.isServer) {
    $tw.wiki.addEventListener("change", function (changes) {
      let res = {};
      Object.keys(changes).forEach(function (k) { res[k] = changes[k].deleted ? "deleted" : "modified" });
      $tw.serverEvents.broadcastEvent('server-refresh', JSON.stringify(res));
    });
  } else {
    $tw.serverEvents.addEventListener(
      "server-refresh",
      /**
       * @param {MessageEvent} e 
       */
      function serverRefresh(e) {
        console.log(msg);
        // let changes = JSON.parse(msg.data);
        // Object.keys(changes).forEach(k => {
        //     if (changes[k] === "deleted") $tw.wiki.deleteTiddler(k);
        // });
        $tw.syncer.syncFromServer();
      }
    );
  }
}

})();
