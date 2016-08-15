const memory      = require('./memory.js');
const FnCache     = require('./fn-cache.js');
const QueueEntry  = require('./queue-entry.js');
const Response    = require('./response.js');
const Semaphore   = require('synchronous-semaphore');
const { tapLog }  = require('./util.js');


// Queue
// =====
// This is a simple queue object that queues up requests making use
// of a cache object.  It is intended that this queue will be used
// to flatten out the demand for a resource that sits behind it.
// @param {iCache} cache
// @param {EntryFactory} entry_factory
function Queue(cache, ttl) {
  this.cache        = cache || memory();
  this.fn_cache     = FnCache();
  this.queue        = QueueEntry(this.fn_cache, this.cache);
  this.ttl          = ttl;
  this.semaphore    = Semaphore();
}
Queue.prototype     = {
  // Queue up the given task using the given key as an
  // identifier.
  // @param {string} key
  // @param {Function} task
  // @param {Function} done
  // @param {number} ttl - the time to live for the queue cache.
  // @return {Queue}
  'run': function (key, task, done, ttl) {
    const queue     = this.queue;
    const semaphore = this.semaphore;

    if (!ttl) ttl = this.ttl;


    const runTask = (res) => new Promise((resolve) =>
      task( (...args) => resolve(Response.setData(res, args)) )
    );


    const startThenRunTask = (lock_key) =>
      queue.start(key, Response.factory(ttl))
      .then(runTask)
      .then(queue.dequeue.bind(null, key))
      .then(() => semaphore.release(key, lock_key))
      .catch((err) => {
        semaphore.release(key, lock_key);
        throw err;
      })
    ;


    const startIfNotWaiting = () =>
      Promise.all([
        queue.isWaiting(key)
      , semaphore.lock(key)
      ])
      .then(([ is_waiting, lock_key ]) =>
        (!is_waiting && lock_key) ? startThenRunTask(lock_key) : null
      )

    return queue
      .add(key, done)
      .then(startIfNotWaiting)
    ;
  }

};

module.exports = Queue;
