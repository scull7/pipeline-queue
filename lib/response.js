

DEFAULT_TTL     = 0;
DEFAULT_WAITING = 0;


var ensureResponse = function(response) {
  if (!isResponse(response)) throw new TypeError('Invalid Response Object');

  return response;
};

var isResponse = function(arg) {
  return arg &&
    arg.hasOwnProperty('ttl') &&
    arg.hasOwnProperty('args') &&
    arg.hasOwnProperty('waiting') &&
    arg.hasOwnProperty('timestamp');
  ;
};


var factory = function(ttl, waiting) {
  ttl = (ttl === undefined) ? DEFAULT_TTL : ttl;
  waiting = (waiting === undefined) ? DEFAULT_WAITING : waiting;
  args = null;
  timestamp = null;

  return { ttl: ttl, waiting: waiting, args: args, timestamp: timestamp };
}


var isWaiting = function(response) {
  return ensureResponse(response).waiting === 1;
};


var isAlive = function(response) {
  ensureResponse(response);
  var now = new Date().getTime();

  return response.args !== null &&
    (now - response.timestamp) < response.ttl
  ;
};


var setData = function(response, args) {
  ensureResponse(response);

  response.timestamp = new Date().getTime();
  response.args      = args;
  response.waiting   = 0;

  return response;
};


var getData = function(response) {
  ensureResponse(response);

  if (!isAlive(response)) {
    throw new Error('Cannot get data from a dead response object');
  }

  return response.args
};


var startWaiting = function(response) {
  ensureResponse(response);

  if (isWaiting(response)) throw new Error('Already In Progress');

  response.waiting = 1;

  return response;
};


module.exports = {
  factory: factory
, ensureResponse: ensureResponse
, isResponse: isResponse
, isWaiting: isWaiting
, isAlive: isAlive
, setData: setData
, getData: getData
, startWaiting: startWaiting
};
