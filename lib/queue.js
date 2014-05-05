// Queue
// =====
// This is a simple queue object that queues up requests making use
// of a cache object.  It is intended that this queue will be used 
// to flatten out the demand for a resource that sits behind it.
// @param {iCache} cache
// @param {EntryFactory} entry_factory
function Queue(entry_factory, cache) {
  this.entry_factory = entry_factory;
  this.cache = cache || {
    'set': function () { return; },
    'key': function () { return false; },
    'get': function () { return null; } 
  };
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
    var entry = this.getEntry(key), done;

    if(entry.isValid(ttl)) {
      callback.apply(null, entry.getLast());
    } else {
      entry.add(callback);
      done = this.getHandler(entry);

      if(!entry.isActive()) {
        entry.active = 1;
        task(null, done);
      }
    }
    return this;
  },
  // Get a queue entry for a given key.
  // @param {string} key
  // @return QueueEntry
  'getEntry': function (key) {
    var entry;

    if(!this.cache.key(key)) {
      entry = this.entry_factory.getNew();
      this.cache.set(key, entry);
    } else {
      entry = this.cache.get(key);
    }
    return entry;
  },
  // Get a handler to run the given entry in the proper
  // context
  // @param QueueEntry
  // @return {function}
  'getHandler': function (entry) {
    return function () { entry.run.apply(entry, arguments); };
  }
};

module.exports = Queue;
