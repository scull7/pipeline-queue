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
  
  it('should accept a factory option', function () {
    var factory = {},
    queue = QueueFactory({ factory: factory });
    expect(queue).to.be.an.instanceOf(Queue);
    expect(queue.entry_factory).to.be.eql(factory);
  });

  it('should not call a given handler more than once', function (done) {
    var queue     = QueueFactory(),
        workCall  = 0,
        count     = 0,
        finished  = function () {
                    count++

                    if (count > 2) {
                      process.nextTick(function () {
                        expect(workCall).to.eql(2);
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
});
