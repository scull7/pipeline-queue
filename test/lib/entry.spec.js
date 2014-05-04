var QueueEntry = require(__dirname + '/../../lib/entry');

describe('Entry', function () {
  var entry;

  beforeEach(function() {
    entry = new QueueEntry();
  });

  it('should be an instance of the QueuEntry object.', function () {
    expect(entry).to.be.an.instanceof(QueueEntry);
  });

  it('should initialize with an empty queue', function () {
    expect(entry).to.have.property('queue').that.is.an('array');
    expect(entry).to.have.property('queue').that.is.empty;
  });

  it('should initialize inactive', function () {
    expect(entry).to.have.property('active', 0);
  });

  it('should initialize with a null last response', function () {
    expect(entry).to.have.property('last', null);
  });

  it('should initialize with a null time of last response', function () {
    expect(entry).to.have.property('time', null);
  });

  it('should have an add function', function () {
    expect(entry).to.have.property('add').that.is.a('function');
  });

  describe('add', function () {
    it('should push the given callback function on to the queue.', function () {
      entry.queue.push = spy = sinon.spy();
      var test = function () {};
      expect(entry.add(test)).to.eql(entry);
      spy.should.have.been.calledOnce;
      spy.should.have.been.calledWith(test);
    });
  });

  it('should have an isValid function', function () {
    expect(entry).to.have.property('isValid').that.is.a('function');
  });

  describe('isValid', function () {
    it('should return false on a newly initialized object.', function () {
      expect(entry.isValid()).to.be.false;
    });
  });

  it('should have an isActive function', function () {
    expect(entry).to.have.property('isActive').that.is.a('function');
  });

  describe('isActive', function () {
    it('should return false on a newly initialized object', function () {
      expect(entry.isActive()).to.be.false;
    });

    it('should return true when the object is marked active', function () {
      entry.active = 1;
      expect(entry.isActive()).to.be.true;
    });
  });

  it('should have an run function', function () {
    expect(entry).to.have.property('run').that.is.a('function');
  });

  it('should have an getLast function', function () {
    expect(entry).to.have.property('getLast').that.is.a('function');
  });

  describe('getLast', function () {
    it('should return null on a newly initialized object', function () {
      expect(entry.getLast()).to.be.null;
    });
  });
});