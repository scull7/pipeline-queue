/*global describe, it, beforeEach, expect, sinon */
var Queue = require(__dirname + '/../../lib/queue.js');
describe ('Queue', function () {
  var queue;
  beforeEach(function () {
    entry_factory = {}; 
    queue = new Queue(entry_factory); 
  });

  it('should initialize with a sudo cache object', function () {
    expect(queue).to.have.property('cache').that.is.an('object');
  });

  describe('Queue#cache', function () {
    it('should have a set function', function () {
      expect(queue.cache).to.have.property('set').that.is.a('function');
    });

    describe('Queue#cache#set()', function () {
      it('should return the value returned by the given done function.', function () {
        var test = function () { return null; };
        expect(queue.cache.set('test', 'value', test)).to.be.null;
      });
    });

    it('should have a get function', function () {
      expect(queue.cache).to.have.property('get').that.is.a('function');
    });

    describe('Queue#cache#get()', function () {
      it('should return the value returned by the given done function. ', function () {
        var test = function () { return null; };
        expect(queue.cache.get('test', test)).to.be.null;
      });
    });
  });

  it('should have a run function', function () {
    expect(queue).to.have.property('run').that.is.a('function'); 
  });

  describe('#run()', function () {
    var entry, callback, task;

    beforeEach(function () {
      callback = sinon.spy();
      task = sinon.spy();
      entry = {
        'isValid': sinon.spy(),
        'add': sinon.spy(),
        'isActive': sinon.spy(),
        'getLast': sinon.spy()
      };
      entry.getLast = sinon.stub().returns(['test']);
      queue.entry_factory.getNew = sinon.stub().returns(entry);
    });

    it('should return the queue object.', function () {
      var response = queue.run('test', task, callback, 42);
      expect(response).to.be.eql(queue);
    });
    it('should call the callback when the entry is valid.', function () {
      entry.isValid = sinon.stub().returns(true);
      var response = queue.run('test', task, callback, 42);
      entry.isValid.should.have.been.calledWith(42);
      callback.should.have.been.calledWith('test');
      task.should.not.have.been.called;
    });
    it('should add the callback to the entry when the entry is not valid.', function () {
      entry.isActive = sinon.stub().returns(true);
      entry.isValid = sinon.stub().returns(false);

      var response = queue.run('test', task, callback, 42);

      entry.isValid.should.have.been.calledWith(42);
      callback.should.not.have.been.called;
      entry.add.should.have.been.calledWith(callback);
      task.should.not.have.been.called;
    });
    it('should initiate the task when the entry is not active.', function () {
      entry.isActive = sinon.stub().returns(false);
      entry.isValid = sinon.stub().returns(false);

      var test_handler = sinon.spy();
      queue.getHandler = sinon.stub().returns(test_handler);

      var response = queue.run('test', task, callback, 42);

      entry.isValid.should.have.been.calledWith(42);
      callback.should.not.have.been.called;
      entry.add.should.have.been.calledWith(callback);
      task.should.have.been.calledWith(null, test_handler);
    });
  });

  it('should have a getEntry function', function () {
    expect(queue).to.have.property('getEntry').that.is.a('function');
  });

  describe('#getEntry', function () {
    beforeEach(function () {
      sinon.spy(queue.cache,'set');
      sinon.spy(queue.cache,'get');
      
      queue.entry_factory = {
        'getNew': sinon.spy()
      };
    });
    afterEach(function () {
      queue.cache.set.restore();
      queue.cache.get.restore();
    });

    it('should return an entry from the factory getNew() function when the cache key does not exist.', function (done) {
      var test_entry = {};
      queue.entry_factory.getNew = sinon.stub().returns(test_entry);
      var response = queue.getEntry('dne', function (err, entry) {
        queue.cache.set.should.have.been.calledWith('dne',test_entry);
        queue.entry_factory.getNew.should.have.been.calledOnce;
        done();
      });
      expect(response).to.eql(queue);
    }); 
    it('should return an entry from the cache when the key exists.', function () {
      var test_entry = {};
      queue.cache.get = function (key, done) {
        return done(null, test_entry);
      };
      sinon.spy(queue.cache, 'get');

      var response = queue.getEntry('exists', function (err, entry) {
        queue.cache.set.should.not.have.been.called;
        queue.entry_factory.getNew.should.not.have.been.called;
        queue.cache.get.should.have.been.calledWith('exists');
        expect(entry).to.be.eql(test_entry);
      });
      expect(response).to.be.eql(queue);
    });
    it('should not call the cache#set() function if an error is returned from the cache.', function (done) {
      queue.cache.get = function (key, done) {
        return done('error');
      };
      sinon.spy(queue.cache, 'get');
      queue.getEntry('has_error', function (err, entry) {
        queue.cache.set.should.not.have.been.called;
        done();
      });
    });
  }); 
  it('should have a getHandler function', function () {
    expect(queue).to.have.property('getHandler').that.is.a('function');
  });

  describe('#getHandler', function () {
    var entry = {
      'run': sinon.spy()
    };
    it('should return a function', function () {
      expect(queue.getHandler()).to.be.a('function');
    });
    it('should return a function that runs the given entry\'s run function when called.', function () {
      var done = queue.getHandler(entry);
      done();
      entry.run.should.have.been.calledOnce;
    });
    it('should return a handler function that proxy\'s the arguments to the run function.', function () {
      var done = queue.getHandler(entry);
      done('test1', 'test2','test3');
      entry.run.should.have.been.calledWith('test1','test2','test3');
    });
  });
});
