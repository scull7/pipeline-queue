// Queue Entry
// ===========
// A queue entry object that represents an entry in the 
// request queue.
function Entry() {
  // @var {Array}
  this.queue = [];
  // @var {number}
  this.active = 0;
  // @var {number}
  this.time = null;
  // @var {Array}
  this.last = null;
}
Entry.prototype = {
  // Add a callback handler.
  // @param {Function} callback
  // @return {Entry}
  'add': function (callback) {
    this.queue.push(callback);
    return this;
  },
  // Is this entry currently valid?  i.e. has the given TTL (Time-to-Live) 
  // passed?
  // @param {number} ttl
  // @return {boolean}
  'isValid': function (ttl) {
    if (!this.last) {
      return false;
    }
    var now = (new Date()).getTime();
    return (now - this.time) < ttl ? true : false;
  },
  // Is the task for this Queue item currently running?
  // @return {boolean}
  'isActive': function () {
    return this.active ? true : false;
  },
  // Run all of the handlers queued up in this entry queue.
  // @return {Entry}
  'run': function () {
    var args = Array.prototype.slice.call(arguments),
    handler = this.getHandler(args);

    this.active = 0;
    this.last = args;
    this.time = (new Date()).getTime();

    this.queue.forEach(handler);
    // Make sure that we clear the queue
    this.queue  = [];

    return this;
  },
  // Get the iteration handler function.
  // @param {array}
  // @return {function}
  'getHandler': function (args) {
    return function(element) {
      element.apply(null, args);
    };
  },
  // Get the last response.
  // @return {*}
  'getLast': function () {
    return this.last;
  }
};

module.exports = Entry;
