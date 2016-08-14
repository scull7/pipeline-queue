/*global describe, it, expect */
var QueueFactory = require(__dirname + '/../index.js'),
    Queue = require(__dirname + '/../lib/queue.js');

describe('QueueFactory', function () {
  it('should be a function', function () {
    expect(QueueFactory).to.be.a('function');
  });

  it('should return a Queue object.', function () {
    expect(QueueFactory()).to.be.an.instanceOf(Queue);
  });

  it('should accept a cache option', function () {
    var cache = {},
    queue = QueueFactory({ cache: cache });
    expect(queue).to.be.an.instanceOf(Queue);
    expect(queue.cache).to.be.eql(cache);
  });


  it('should accept a ttl option', function() {

    var ttl = 50;
    queue = QueueFactory({ ttl: ttl });
    expect(queue).to.be.an.instanceOf(Queue);
    expect(queue.ttl).to.eql(ttl);

  });

  it('should not call a given handler more than once', function (done) {
    var queue     = QueueFactory(),
        workCall  = 0,
        count     = 0,
        finished  = function () {
                    count++

                    if (count > 2) {
                      process.nextTick(function () {
                        expect(workCall).to.eql(1);
                        expect(count).to.eql(3)
                        done();
                      });
                    }
                  },
        work      = function (cb) {
                    workCall++;
                    process.nextTick(cb.bind(cb, null, 'hello', 'world'));
                  },
        handler1  = function (err, first, second) {
                    expect(err).to.be.null;
                    expect(first).to.eql('hello');
                    expect(second).to.eql('world');
                    finished();
                  },
        handler2  = function (err, first, second) {
                    expect(err).to.be.null;
                    expect(first).to.eql('hello');
                    expect(second).to.eql('world');
                    finished();
                  }
    ;

    queue.run('task', work, handler1);
    queue.run('task', work, handler2);

    process.nextTick(function () {
      queue.run('task', work, handler1);
    });
  });


  it('should allow for a cloned object cache', function(done) {

    var store = {};
    var cache = {
      get: function(key, cb) {
        if (store.hasOwnProperty(key)) {
          return cb(null, Object.assign({}, store[key]));
        }
        return cb(null);
      }
    , set: function(key, value, cb) {
        store[key] = value;
        return cb(null, value);
      }
    };

    var queue = QueueFactory({ cache: cache });
    var workCall  = 0;
    var count     = 0;
    var finished  = function () {
                    count++

                    if (count > 2) {
                      process.nextTick(function () {
                        expect(workCall).to.eql(1);
                        expect(count).to.eql(3)
                        done();
                      });
                    }
                  };
    var work      = function (cb) {
                    workCall++;
                    process.nextTick(cb.bind(cb, null, 'hello', 'world'));
                  };
    var handler1  = function (err, first, second) {
                    expect(err).to.be.null;
                    expect(first).to.eql('hello');
                    expect(second).to.eql('world');
                    finished();
                  };
    var handler2  = function (err, first, second) {
                    expect(err).to.be.null;
                    expect(first).to.eql('hello');
                    expect(second).to.eql('world');
                    finished();
                  }
    ;

    queue.run('task', work, handler1);
    queue.run('task', work, handler2);

    process.nextTick(function () {
      queue.run('task', work, handler1);
    });

  });

});
