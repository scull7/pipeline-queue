var QueueFactory = require(__dirname + '/../../../lib/entry/factory'),
QueueEntry = require(__dirname + '/../../../lib/entry');

describe('Entry Factory', function () {
  var factory;

  beforeEach(function () {
    factory = new QueueFactory();
  });

  it('should have a function named getNew', function(){
    expect(factory.getNew).to.be.a('function');
  });

  describe('#getNew()', function () {
    it('should return a new QueueEntry object', function () {
      var entry = factory.getNew();
      expect(entry).to.be.an.instanceof(QueueEntry);
    });
  });
});