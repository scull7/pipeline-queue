/*eslint-env node, mocha*/
var expect  = require('chai').expect;
var util    = null;
var isArray = Array.isArray;

describe('lib/util.js', function() {

  beforeEach(function() {
    Array.isArray = undefined;
    util          = require('../../lib/util.js');
  });

  afterEach(function() { Array.isArray = isArray });

  describe('::isArray', function() {

    it('should polyfill if Array.isArray is not available', function() {

      var isArray = Array.isArray;

      Array.isArray = undefined;

      expect(util.isArray([])).to.be.true;
      expect(util.isArray('boo')).to.be.false;
      expect(util.isArray({})).to.be.false;

      Array.isArray = isArray;

    });

  });

});
