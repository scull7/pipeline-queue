// This is a simple in memory cache for use with the
// pipeline queue.

// Export the constructor function
// @return Cache
module.exports  = function () {
  var cache = {};

  return {
    /**
     * Set the given value at the given key within th
     * the cache.
     * @param {string} key
     * @param {*} value
     * @param {function} done
     */
    'set': function (key, value, done) {
      //We blindly overwrite
      cache[key]  = value;

      return done(null, value);
    },
    /**
     * Attempt to retrieve the set value for the given key.
     * @param {string} key
     * @param {function} done
     */
    'get': function (key, done) {
      var val = null;
      if(cache.hasOwnProperty(key)) {
        val = cache[key];
      }
      return done(null, val);
    },
    /**
     * Delete the entire cache
     */
    'clear': function (done) {
      cache = {};

      return done(null);
    }
  };
};
