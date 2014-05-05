/*global describe, it, beforeEach, expect, sinon */
var Queue = require(__dirname + '/../../lib/queue.js');
describe ('Queue', function () {
  var queue;
  beforeEach(function () {
    var cache = {},
    entry_factory = {}; 
    queue = new Queue(cache, entry_factory); 
  });

  it('should have a run function', function () {
    expect(queue).to.have.property('run').that.is.a('function'); 
  });

  describe('#run()', function () {
    var entry, callback, task;

    beforeEach(function () {
      queue.entry_factory.getNew = sinon.stub().returns(entry);
      callback = sinon.spy();
      task = sinon.spy();
      entry = {
        'isValid': sinon.spy(),
        'add': sinon.spy(),
        'isActive': sinon.spy(),
        'getLast': sinon.spy()
      };
      entry.getLast = sinon.stub().returns(['test']);
      queue.getEntry = sinon.stub().returns(entry);
    });

    it('should call the callback with the value of the last response when a valid entry is given', function () {
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
      queue.cache = {
        'hasKey': sinon.spy(),
        'add': sinon.spy(),
        'get': sinon.spy()
      };
      queue.entry_factory = {
        'getNew': sinon.spy()
      };
    });
    it('should return an entry from the factory getNew() function when the cache key does not exist.', function () {
      queue.cache.hasKey = sinon.stub().returns(false);
      var test_entry = {};
      queue.entry_factory.getNew = sinon.stub().returns(test_entry);
      expect(queue.getEntry('dne')).to.eql(test_entry);
      queue.cache.hasKey.should.have.been.calledWith('dne');
      queue.cache.add.should.have.been.calledWith('dne',test_entry);
      queue.entry_factory.getNew.should.have.been.calledOnce;
    }); 
    it('should return an entry from the cache when the key exists.', function () {
      queue.cache.hasKey = sinon.stub().returns(true);
      var test_entry = {};
      queue.cache.get = sinon.stub().returns(test_entry);
      expect(queue.getEntry('exists')).to.be.eql(test_entry);
      queue.cache.hasKey.should.have.been.calledWith('exists');
      queue.cache.add.should.not.have.been.called;
      queue.entry_factory.getNew.should.not.have.been.called;
      queue.cache.get.should.have.been.calledWith('exists');
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
  
  it('should have a flush function', function () {
    expect(queue).to.have.property('flush').that.is.a('function');
  });

  describe('#flush()', function () {
    it('should call the cache cache.clear() function when no key is given', function () {
      var spy = sinon.spy();
      queue.cache.clear = spy;
      expect(queue.flush()).to.be.eql(queue);
      spy.should.have.been.calledOnce;
    });
    it('should call the cache.remove() function when a key is given.', function () {
      var spy = sinon.spy();
      queue.cache.remove = spy;
      expect(queue.flush(42)).to.be.eql(queue);
      spy.should.have.been.calledWith(42);
    });
  });

  it('should have a prune function', function () {
    expect(queue).to.have.property('prune').that.is.a('function');
  });

  describe('#prune()', function () {
    it('should call the cache.prune() function', function () {
      var spy = sinon.spy();
      queue.cache.prune = spy;
      expect(queue.prune()).to.be.eql(queue);
      spy.should.have.been.calledOnce; 
    });
    it('should pass the given time to live to the cache.prune() function', function () {
      var spy = sinon.spy();
      queue.cache.prune = spy;
      queue.prune(42);
      spy.should.have.been.calledWith(42);
    });
  });

  it('should have a size function', function () {
    expect(queue).to.have.property('size').that.is.a('function');
  });

  describe('#size()', function () {
    it('should call the cache.size() function', function () {
      var spy = sinon.stub().returns(42);
      queue.cache.size = spy;
      expect(queue.size()).to.be.eql(42);
      spy.should.have.been.calledOnce;
    }); 
  });
});