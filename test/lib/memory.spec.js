/*eslint-env node, mocha*/
var expect  = require('chai').expect;
var memory  = require(__dirname + '/../../lib/memory');

describe('Memory', function () {
  var cache;

  beforeEach(function () {
    cache = memory();
  });

  describe ('::set()', function () {

    it('should be a function with an arity of 3', function () {
      expect(cache.set).to.be.a('function');
      expect(cache.set.length).to.eql(3);
    });

    it('should set the given value into the cache at the given key', function (done) {
      cache.set('test_key', 'test_value', function (err, val) {
        expect(val).to.eql('test_value');

        cache.get('test_key', function (err, res) {
          expect(res).to.eql('test_value');
          done();
        });
      });
    });
  });

  describe ('::get()', function () {

    it('should be a function with an arity of 2', function () {
      expect(cache.get).to.be.a('function');
      expect(cache.get.length).to.eql(2);
    });

    it('should return null for a key that does not exist', function (done) {
      cache.get('test_key', function (err, val) {
        expect(val).to.be.null;
        done();
      });
    });
  });

  describe ('::clear()', function () {

    it('should be a function with an arity of 1', function () {
      expect(cache.clear).to.be.a('function');
      expect(cache.clear.length).to.eql(1);
    });

    it('should clear the cache object', function(done) {
      cache.set('stuff', 'thing', function (err) {

        if (err) return done(err);

        cache.get('stuff', function (err, ret) {

          if (err) return done(err);

          expect(ret).to.eql('thing');

          cache.clear(function(err) {

            if (err) return done(err);

            cache.get('stuff', function (err, empty) {
              expect(empty).to.be.null;
              done();
            });
          });
        });
      });
    });
  })
});
