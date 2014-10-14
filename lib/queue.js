var memory  = require(__dirname + '/memory');
// Queue
// =====
// This is a simple queue object that queues up requests making use
// of a cache object.  It is intended that this queue will be used
// to flatten out the demand for a resource that sits behind it.
// @param {iCache} cache
// @param {EntryFactory} entry_factory
function Queue(entry_factory, cache) {
  this.entry_factory = entry_factory;
  this.cache = cache || memory();
}
Queue.prototype = {
  // Queue up the given task using the given key as an
  // identifier.
  // @param {string} key
  // @param {Function} task
  // @param {Function} callback
  // @param {number} ttl - the time to live for the queue cache.
  // @return {Queue}
  'run': function (key, task, callback, ttl) {
    var handler = (function (get_handler, task, callback, ttl) {
      return function (err, entry) {
        var done;

        if (entry.isValid(ttl)) {
          return callback.apply(null, entry.getLast());
        }
        entry.add(callback);
        done = get_handler(entry);

        if(!entry.isActive()) {
          entry.active = 1;
          task(null, done);
        }
      };
    }(this.getHandler, task, callback, ttl));

    return this.getEntry(key, handler);
  },
  // Get a queue entry for a given key.
  // @param {string} key
  // @param {Function} done
  // @return {Queue}
  'getEntry': function (key, done) {
    var cache = this.cache,
      handler = (function(factory) {

          return function (err, entry) {
            if (!entry) {
              entry = factory.getNew();

              if (!err) {
                return cache.set(key, entry, function () {
                  return done(null, entry);
                });

              }
              return done(null, entry);
            }
          };
        }(this.entry_factory));

    cache.get(key, handler);

    return this;
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
