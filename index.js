var Queue = require(__dirname + '/lib/queue'),
    EntryFactory = require(__dirname + '/lib/entry/factory');

module.exports = function (options) {
  var cache;

  if(!options) {
    options = {};
  }

  if(options.cache) {
    cache = options.cache;
  }
  if(!options.factory) {
    options.factory = new EntryFactory();
  }

  return new Queue(options.factory, cache);
};
