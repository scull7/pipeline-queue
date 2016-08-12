/*global describe, it, expect*/
var FnCache    = require('../../lib/fn-cache.js');
var fn_cache   = null;
var test_cache = null;


describe('Function Cache', function() {

  beforeEach(function() {

    fn_cache   = FnCache();
    test_cache = {
      set: sinon.stub().yields(null, [])
    , get: sinon.stub().yields(null, [])
    };

  });

  it('should add the given function to the function queue at the ' +
  'given key', function(done) {

    var key = 'ihateallthethings';
    var fn  = function() { return 'fuck'; };

    fn_cache.set(key, fn, function(err, fnx) {
      if (err) return done(err);

      expect(fnx[0]).to.eql(fn);

      fn_cache.get(key, function (err, queue) {

        if (err) return done(err);

        expect(queue.length).to.eql(1);
        expect(queue[0]).to.eql(fn);

        done();

      });
      
    });

  });

  it('should delete a key when accessed', function(done) {

    var  key = 'deleteme';
    var fn   = function() { return 'now'; };

    fn_cache.set(key, fn, function(err) {

      if (err) return done(err);

      fn_cache.get(key, function(err2) {

        if (err2) return done(err2);

        fn_cache.get(key, function(err3, queue) {

          if (err3) return done(err3);

          expect(queue).to.be.null;
          return done();

        });

      });

    });

  });


  it('should push a function on the the queue when setting an already ' +
  'existing key', function(done) {

    var key = 'iexist';
    var fn1 = function() { return 'one'; };
    var fn2 = function() { return 'two'; };

    fn_cache.set(key, fn1, function(err) {

      if (err) return done(err);

      fn_cache.set(key, fn2, function(err2) {

        if (err2) return done(err2);

        fn_cache.get(key, function(err3, queue) {

          if (err3) return done(err3);

          expect(queue[0]).to.eql(fn1);
          expect(queue[1]).to.eql(fn2);
          done();

        });

      });

    });

  });


  it('should bubble up a get error through the set call', function(done) {

    test_cache.get = sinon.stub().yields('foo');
    fn_cache       = FnCache(test_cache);

    fn_cache.set('test', 'bar', function(err) {

      expect(err).to.eql('foo');
      done();

    });

  });


  it('should bubble up a get error', function(done) {
    
    test_cache.get = sinon.stub().yields('foo');
    fn_cache       = FnCache(test_cache);

    fn_cache.get('test', function(err) {

      expect(err).to.eql('foo');
      done();

    });


  });


  it('should bubble up a delete error', function(done) {

    test_cache.del = sinon.stub().yields('foo');
    fn_cache       = FnCache(test_cache);

    fn_cache.get('test', function(err) {

      expect(err).to.eql('foo');
      done();

    });

  });

});
