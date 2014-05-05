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
      it('should return undefined', function () {
        expect(queue.cache.set()).to.be.undefined;
      });
    });

    it('should have a key function', function () {
      expect(queue.cache).to.have.property('key').that.is.a('function');
    });

    describe('Queue#cache#key()', function () {
      it('should return undefined', function () {
        expect(queue.cache.key()).to.be.false;
      });
    });

    it('should have a get function', function () {
      expect(queue.cache).to.have.property('get').that.is.a('function');
    });

    describe('Queue#cache#get()', function () {
      it('should return undefined', function () {
        expect(queue.cache.get()).to.be.null;
      });
    });
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
        'key': sinon.spy(),
        'set': sinon.spy(),
        'get': sinon.spy()
      };
      queue.entry_factory = {
        'getNew': sinon.spy()
      };
    });
    it('should return an entry from the factory getNew() function when the cache key does not exist.', function () {
      queue.cache.key = sinon.stub().returns(false);
      var test_entry = {};
      queue.entry_factory.getNew = sinon.stub().returns(test_entry);
      expect(queue.getEntry('dne')).to.eql(test_entry);
      queue.cache.key.should.have.been.calledWith('dne');
      queue.cache.set.should.have.been.calledWith('dne',test_entry);
      queue.entry_factory.getNew.should.have.been.calledOnce;
    }); 
    it('should return an entry from the cache when the key exists.', function () {
      queue.cache.key = sinon.stub().returns(true);
      var test_entry = {};
      queue.cache.get = sinon.stub().returns(test_entry);
      expect(queue.getEntry('exists')).to.be.eql(test_entry);
      queue.cache.key.should.have.been.calledWith('exists');
      queue.cache.set.should.not.have.been.called;
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
});
