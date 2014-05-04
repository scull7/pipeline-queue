// Queue
// =====
// This is a simple queue object that queues up requests making use
// of a cache object.  It is intended that this queue will be used 
// to flatten out the demand for a resource that sits behind it.
// @param {iCache} cache
// @param {EntryFactory} entry_factory
function Queue(cache, entry_factory) {
  this.cache = cache;
  this.entry_factory = entry_factory;
}
Queue.prototype = {
  // Queue up the given task using the given key as an
  // identifier.
  // @param {string} key
  // @param {Function} task
  // @param {Function} callback
  // @param {number} ttl - the time to live for the queue cache.
  // @return Queue
  'run': function (key, task, callback, ttl) {
    var entry, done;

    if(!this.cache.hasKey(key)) {
      entry = this.entry_factory.getNew();
      this.cache.add(key, entry);
    } else {
      entry = this.cache.get(key);
    }

    if(entry.isValid(ttl)) {
      callback.apply(null, entry.getLast());
    } else {
      entry.add(callback);
      done = (function (entry) {
        return function() { entry.run.apply(entry, arguments); };
      }(entry));

      if(!entry.isActive()) {
        task(null, done);
      }
    }
  },
  // Flush (clear) all cached items or just a given key.
  // @param {string} key
  // @return Queue
  'flush': function (key) {
    if(!key) {
      this.cache.clear();
    } else {
      this.cache.remove(key);
    }
    return this;
  },
  // Remove all cache items older than the given TTL (Time-to-Live)
  // @param {number} ttl
  // @return {number}
  'prune': function (ttl) {
    this.cache.prune(ttl);
    return this;
  },
  // Return the size (count of items) of the current queue.
  // @return {number}
  'size': function () {
    return this.cache.size();
  }
};

module.exports = Queue;
