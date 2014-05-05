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
});
