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
  // @param {Function} done
  // @param {number} ttl - the time to live for the queue cache.
  // @return {Queue}
  'run': function (key, task, done, ttl) {
    this.getEntry(key, function (err, entry) {
      if (err) {
        // We have had some sort of cache error 
        // that needs to be pushed up the chain.
        return done(err);
      }

      // If we have a valid entry with a good last
      // response we just pass that along.
      if (entry.isValid(ttl)) {
        return done.apply(done, entry.getLast());
      }

      // If not then we need to add the current call back
      // to the Queue list.
      entry.add(done);

      //If we are not currently active, then we need to kick off
      //the task execution process.
      if (!entry.isActive()) {
        entry.active  = 1;
        task(function () {
          return entry.run.apply(entry, arguments);
        });
      }
    });
    return this;
  },

  // Get a queue entry for a given key.
  // @param {string} key
  // @param {Function} done
  // @return {Queue}
  'getEntry': function (key, done) {
    var cache         = this.cache,
        EntryFactory  = this.entry_factory
    ;

    cache.get(key, function (err, entry) {
      if (err) {
        // Something went wrong with our caching mechanism
        // Need to push this up the chain.
        return done(err);
      }
      if (!entry) {
        entry = EntryFactory.getNew();

        cache.set(key, entry, function () {
          return done(null, entry);
        });
      } else {
        return done(null, entry);
      }
    });
    return this;
  }
};

module.exports = Queue;
