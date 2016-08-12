
var memory = require('./memory.js');


module.exports = function(user_cache) {

  var cache = user_cache || memory();

  return {

    set: function(key, fn, done) {
      cache.get(key, function(err, current) {

        if (err) return done(err);

        if (current) {
          current.push(fn);

        } else {
          current = [fn];

        }

        cache.set(key, current, done);

      })
    }

  , get: function(key, done) {

      cache.get(key, function(err, queue) {

        if (err) return done(err);

        cache.del(key, function(err2) {

          if (err2) return done(err2);

          done(null, queue);

        });

      });

    }

  };

};
