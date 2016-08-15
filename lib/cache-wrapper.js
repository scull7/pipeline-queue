
/**
 * A wrapper around callback based cache libraries to turn them into
 * promise based ones.
 */
const { callbackResolver } = require('./util.js');

module.exports = function(cache) {

  return {

    has: (key) => new Promise((resolve, reject) =>
      cache.has(key, callbackResolver(resolve, reject))
    )

  , set: (key, value) => new Promise((resolve, reject) =>
      cache.set(key, value, callbackResolver(resolve, reject))
    )

  , get: (key) => new Promise((resolve, reject) =>
      cache.get(key, callbackResolver(resolve, reject))
    )

  , del: (key) => new Promise((resolve, reject) =>
      cache.del(key, callbackResolver(resolve, reject))
    )

  };

};
