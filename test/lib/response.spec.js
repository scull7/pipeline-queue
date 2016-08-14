/*eslint-env node, mocha*/

var expect   = require('chai').expect;
var sinon    = require('sinon');
var Response = require('../../lib/response.js');


describe('lib/response.js', function() {

  describe('::isResponse', function() {

    it('should return true if the given object looks like a response object',
    function() {

      var test = {
        ttl: 250
      , args: [ 'foo', 'bar' ]
      , waiting: 0
      , timestamp: null
      };
      expect(Response.isResponse(test)).to.be.true;

    });


    it('should return false if the given object does not have a required field',
    function() {

      var test = { args: [ 'foo', 'bar' ], waiting: 0 };
      expect(Response.isResponse(test)).to.be.false;

      test = { ttl: 250, waiting: 0 };
      expect(Response.isResponse(test)).to.be.false;

      test = { ttl: 250, args: [ 'foo', 'bar' ] };
      expect(Response.isResponse(test)).to.be.false;

    });
  });

  describe('::factory', function() {

    it('should generate a valid response object', function() {

      var actual = Response.factory(250, 0, [ null, 'foo', 'bar' ]);
      expect(Response.isResponse(actual)).to.be.true;

    });

    it('should default the ttl to 0', function() {

      var response = Response.factory(undefined, 0, [ null, 'foo', 'bar']);
      expect(response.ttl).to.eql(0);

    });
    
    it('should default the waiting flag to 0', function() {

      var response = Response.factory(250, undefined, [ null, 'foo', 'bar']);
      expect(response.waiting).to.eql(0);

    });


  });


  describe('::isWaiting', function() {

    it('should return true if waiting is 1', function() {

      var response = Response.factory(250, 1, [ null, 'foo', 'bar']);
      expect(Response.isWaiting(response)).to.be.true;

    });


    it('should throw a type error if the given object is not a valid response',
    function() {

      var test = function() { Response.isWaiting({}); };
      expect(test).to.throw(TypeError, /Invalid Response Object/);

    });

  });


  describe('::getData', function() {

    beforeEach(function() { this.clock = sinon.useFakeTimers(); });

    afterEach(function() { this.clock.restore(); });

    it('should throw an Error when given a dead object', function() {

      var res  = Response.factory(250);
      res      = Response.setData(res, 'boo');

      this.clock.tick(251);

      var test = function() {
        return Response.getData(res);
      };

      expect(test).to.throw(
        Error
      , /Cannot get data from a dead response object/
      );

    });

  });


  describe('::isAlive', function() {

    beforeEach(function() { this.clock = sinon.useFakeTimers(); });

    afterEach(function() { this.clock.restore(); });

    it('should return true if the response object has data and is within ' +
    'its time to live period', function() {

      var response = Response.factory(250);
      response = Response.setData(response, [ null, 'foo', 'bar' ]);

      this.clock.tick(240);

      var actual = Response.isAlive(response);
      expect(actual).to.be.true;

    });


    it('should return false if the response object has a timestamp older ' +
    'than the ttl value allows', function() {

      var response = Response.factory(250);
      response = Response.setData(response, [ null, 'foo', 'bar' ]);

      this.clock.tick(251);

      var actual = Response.isAlive(response);
      expect(actual).to.be.false;

    });


    it('should return false if the response object does not have any data',
    function() {

      var response = Response.factory(250);

      var actual = Response.isAlive(response);
      expect(actual).to.be.false;
    });

  });


  describe('::startWaiting', function() {

    it('should mark the given response as waiting', function() {

      var response = Response.factory();
      response = Response.startWaiting(response);

      expect(Response.isWaiting(response)).to.be.true;

    });


    it('should throw an error if the response is already waiting',
    function() {
      
      var response = Response.factory();
      response = Response.startWaiting(response);

      var test = function() { Response.startWaiting(response); };

      expect(test).to.throw(Error, /Already In Progress/);
    });

  });

});
