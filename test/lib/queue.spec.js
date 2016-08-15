/*global describe, it, beforeEach, expect, sinon */
var Queue = require(__dirname + '/../../lib/queue.js');
describe ('Queue', function () {
  var queue;
  beforeEach(function () {
    queue = new Queue(); 
  });

  it('should initialize with a sudo cache object', function () {
    expect(queue).to.have.property('cache').that.is.an('object');
  });

  describe('Queue#cache', function () {

    it('should have a set function', function () {
      expect(queue.cache).to.have.property('set').that.is.a('function');
    });


    describe('Queue#cache#set()', function () {

      it('should return the value returned by the given done function.',
      function () {
        var test = function () { return null; };
        expect(queue.cache.set('test', 'value', test)).to.be.null;
      });

    });


    it('should have a get function', function () {
      expect(queue.cache).to.have.property('get').that.is.a('function');
    });

    describe('Queue#cache#get()', function () {

      it('should return the value returned by the given done function. ',
      function () {
        var test = function () { return null; };
        expect(queue.cache.get('test', test)).to.be.null;
      });

    });
  });

  it('should have a run function', function () {
    expect(queue).to.have.property('run').that.is.a('function'); 
  });

});
