/*eslint-env node, mocha*/
var expect     = require('chai').expect;
var sinon      = require('sinon');
var QueueEntry = require('../../lib/queue-entry.js');
var Response   = require('../../lib/response.js');
var FnCache    = require('../../lib/fn-cache.js');
var memory     = require('../../lib/memory.js');

var queue = null;
var fn_cache = null;
var data_cache = null;

describe('lib/queue-entry.js', function() {

  beforeEach(function() {

    fn_cache   = FnCache();
    data_cache = memory();
    queue      = QueueEntry(fn_cache, data_cache);

  });

  it('should be able to set and retrieve a function queue',
  function(done) {


    function run(run_count, total, to_go) {

      const fn_cache   = FnCache();
      const data_cache = memory ();
      const queue      = QueueEntry(fn_cache, data_cache);

      //console.time('RUNTIME');
      const start = new Date().getTime();
      const key   = 'mytestkey';
      const fn    = function() { return 'foo'; };

      var thenCheck = function(err, response) {
        if (err) return done(err);

        //console.timeEnd('RUNTIME');

        expect(response).to.deep.eql([fn]);

        var end = new Date().getTime();
        total   += (end - start);

        if (to_go < 1) {
          //console.log('RUNTIME AVG: ', total / run_count);
          done();

        } else {
          setTimeout(run, 0, run_count, total, (to_go - 1))
        }
      };

      var thenRetrieve = function(err, response) {
        if (err) return done(err);
        expect(response).to.deep.eql([fn]);

        queue.get(key, thenCheck);
      };

      queue.add(key, fn, thenRetrieve);
    }

    run(10, 0, 10);

  });


  it('should bubble up an error from a handler', function(done) {

    data_cache.set = sinon.stub().yields(new Error('unavailable'));
    queue = QueueEntry(fn_cache, data_cache);

    var res = Response.factory(250);
    res = Response.setData(res, [ null, 'foo', 'bar' ]);

    queue.add('test', function() {}, function() {
      
      queue.dequeue('test', res, function(err) {

        expect(err.message).to.eql('unavailable');
        done();

      });
    });

  });


  it('should throw a TypeError if the given data object is not a ' +
  'Response object', function(done) {

    var test = function() {
      queue.dequeue('test', { foo: 'bar' }, function(err) {

        if (err) return done(err);

        done('how did we get here?');
      });
    };

    expect(test).to.throw(TypeError, /Invalid Response Object/);
    done();

  });


  it('should throw an Error if you try to de-queue with a non-alive ' +
  'response object', function() {

    var res  = Response.factory(250);

    var test = function () {
      queue.dequeue('test', res);
    };

    expect(test).to.throw(
      Error
    , /Cannot de-queue with a dead response object/
    );

  });


  it('should be able to de-queue by providing a response',
  function(done) {
    var handlers = 2;

    var handler = function(err, foo, bar) {
      if (err) return done(err);

      handlers -= 1;
      
      expect(foo).to.eql('foo');
      expect(bar).to.eql('bar');

      if (handlers < 1) done();
    }

    var res = Response.factory(250);
    res = Response.setData(res, [null, 'foo', 'bar']);

    queue.add('test', handler, function(err) {

      if (err) return done(err);

      queue.add('test', handler, function(err) {

        if (err) return done(err);

        queue.dequeue('test', res, function(err) {

          if (err) return done(err);

        });

      });
    });

  });


  it('should handle an empty queue on dequeue', function(done) {

    var res = Response.factory(250);
    res = Response.setData(res, [null, 'foo', 'bar']);

    queue.dequeue('test', res, function(err) {

      expect(err).to.be.null;
      done();

    })
    .catch(done);

  });


  it('should handle a non array res.data', function(done) {

    var res = Response.factory(250);
    res     = Response.setData(res, 'foo');

    var handler = function(foo) {

      expect(foo).to.eql(foo);
      done();

    };

    queue.add('test', handler, function(err) {

      if (err) return done(err);

      queue.dequeue('test', res);

    });

  });


  it('should immediately de-queue a handler if there is a response ' +
  ' already registered for the key', function(done) {

    var handler = function(err, foo, bar) {
      if (err) return done(err);

      expect(foo).to.eql('foo');
      expect(bar).to.eql('bar');

      done();

    };

    var res = Response.factory(250);
    res = Response.setData(res, [null, 'foo', 'bar']);

    queue.dequeue('test', res)

    .then(() => queue.add('test', handler))

    .catch(done);

  });


  it('should allow me to start an unstarted task', function(done) {

    var res = Response.factory(250);

    queue.start('test', res, function(err, result) {

      if (err) return done(err);

      expect(Response.isWaiting(result)).to.be.true;
      done();

    });

  });


  it('should throw an error on an already started task', function(done) {

    var res = Response.factory(250);
    res     = Response.startWaiting(res);

    queue.start('test', res)
      .then(() => done(new Error('Unexpected success')))
      .catch((err) => {
        expect(err.message).to.eql('Already In Progress');
        done();
      })
      .catch(done);

  });


  it('should return true when isWaiting is called on a in progress key',
  function(done) {

    var res = Response.factory(250);

    queue.start('test', res, function(err) {

      if (err) return done(err);

      queue.isWaiting('test', function(err, is_waiting) {

        if (err) return done(err);

        expect(is_waiting).to.be.true;
        done();

      });

    });

  });


  it('should bubble up an error from the data cache on an isWaiting call',
  function(done) {

    data_cache.get = sinon.stub().yields(new Error('foo'));

    queue.isWaiting('test', function(err) {

      expect(err.message).to.eql('foo');
      done();

    });

  });


  it('should bubble up an error from the data cache on a start call',
  function(done) {

    var res = Response.factory(250);

    data_cache.get = sinon.stub().yields(new Error('boo'));

    queue.start('test', res, function(err) {
      
      expect(err.message).to.eql('boo');
      done();
    });

  });

});
