Entry = require(__dirname + '/../entry');

// EntryFactory
// ============
// A factory object for creating new queue entry objects.
function EntryFactory() {

}
EntryFactory.prototype = {
  // Create a new QueueEntry object.
  // @return {Entry}
  'getNew': function () {
    return new Entry();
  }
};

module.exports = EntryFactory;