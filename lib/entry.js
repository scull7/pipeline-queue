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
    this.active = 0;
    this.last = arguments;
    this.time = (new Date()).getTime();

    var iterator = (function (args) {
      return function (element) {
        element.apply(null, args);
      };
    }(arguments));

    this.queue.forEach(iterator);

    return Entry;
  },
  // Get the last response.
  // @return {*}
  'getLast': function () {
    return this.last;
  }
};

module.exports = Entry;