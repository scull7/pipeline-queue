var memory      = require('./memory.js');
var QueueEntry  = require('./queue-entry.js');
var Response    = require('./response.js');
// Queue
// =====
// This is a simple queue object that queues up requests making use
// of a cache object.  It is intended that this queue will be used
// to flatten out the demand for a resource that sits behind it.
// @param {iCache} cache
// @param {EntryFactory} entry_factory
function Queue(cache, ttl) {
  this.cache    = cache || memory();
  this.fn_cache = memory();
  this.queue    = QueueEntry(this.fn_cache, this.cache);
  this.ttl      = ttl;
}
Queue.prototype = {
  // Queue up the given task using the given key as an
  // identifier.
  // @param {string} key
  // @param {Function} task
  // @param {Function} done
  // @param {number} ttl - the time to live for the queue cache.
  // @return {Queue}
  'run': function (key, task, done, ttl) {
    var queue   = this.queue;

    if (!ttl) ttl = this.ttl;

    var andThenIfWaiting = function(handler) {
      
      return function() {

        queue.isWaiting(key, function(err, is_waiting) {
          if (!is_waiting) handler();
        })
      }
    };

    var startTask = function(handler) {

      return function() {
        var res = Response.factory(ttl);
        
        queue.start(key, res, function(err) {

          if (err) return done(err);

          handler(res);

        });
      }
    };

    var andThenRunTask  = function(res) {
      task(function() {
        var args = Array.prototype.slice.call(arguments);
        res      = Response.setData(res, args);

        return queue.dequeue(key, res);
      });
    };

    queue.add( key, done, andThenIfWaiting(  startTask( andThenRunTask )));

    return this;
  }

};

module.exports = Queue;
