var Queue       = require('./lib/queue.js');
var DEFAULT_TTL = 250; // 250 milliseconds

module.exports = function (options) {
  var cache    = null;
  var ttl      = DEFAULT_TTL;

  if (!options) options = {};

  if (options.ttl) ttl = options.ttl;

  if (options.cache) cache = options.cache;

  return new Queue(cache, ttl);
};
