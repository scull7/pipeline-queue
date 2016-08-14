
var util              = require('./util.js');
var handlerToCallback = util.handlerToCallback;
var callbackToHandler = util.callbackToHandler;
var Response          = require('./response.js');


// queueAddOrNew :: FunctionQueue -> UserCallback -> FunctionQueue
var queueAddOrNew = function(queue, user_callback) {
  return queue ? queue.concat([ user_callback ]) : [ user_callback ];
}


var getDataAsArray = function(res) {
  var data = Response.getData(res);

  return util.isArray(data) ? data : [ data ];
};


// getQueue :: FunctionCache -> String -> Handler -> void
var getQueue = function(fn_cache, key, handler) {
  return fn_cache.get(key, handlerToCallback(handler));
};


// saveHandler :: FunctionCache -> String ->
//      UserCallback -> Handler -> void
var saveHandler = function(fn_cache, key, user_callback, handler) {

  var myHandler = {
    // onError :: Error -> void
    onError: handler.onError

    // onSuccess :: FunctionQueue -> void
    , onSuccess: function(queue) {
        queue = queueAddOrNew(queue, user_callback);

        return fn_cache.set(key, queue, handlerToCallback(handler));
    }
  };

  return fn_cache.get(key, handlerToCallback(myHandler));
};


// setData :: DataCache -> String -> a -> Handler -> void
var setData = function(data_cache, key, data, handler) {
  return data_cache.set(key, data, handlerToCallback(handler));
};


// add :: Config -> String -> UserCallback -> Callback -> void
var add = function(config, key, user_callback, callback) {

  var handler = callbackToHandler(callback);

  config.data_cache.get(key, function(err, res) {

    if (res && Response.isAlive(res)) {
      var data = getDataAsArray(res);

      return user_callback.apply(null, data);
    }

    return saveHandler(config.fn_cache, key, user_callback, handler);

  });

};


// get :: Config -> String -> Callback -> void
var get = function(config, key, callback) {
  return config.fn_cache.get(key, callback);
};


// dequeue :: Config -> String -> Response -> Callback -> void
var dequeue = function(config, key, res, callback) {

  callback = (typeof callback === 'function') ? callback : util.noop;
  res      = Response.ensureResponse(res);

  if (!Response.isAlive(res)) {
    throw new Error('Cannot de-queue with a dead response object');
  }

  var fn_cache   = config.fn_cache;
  var data_cache = config.data_cache;

  // runner :: Array a -> (UserCallback -> void)
  var runner = function(data) {
    return function(element) {
      return element.apply(null, data);
    };
  };

  // getQueueHandler :: Array a -> Handler -> void
  var getQueueHandler = function (data) {
    return callbackToHandler(function(err, queue) {
      if (err) return callback(err);

      fn_cache.del(key, function(err) {

        if (err) return callback(err);

        if (queue) queue.forEach(runner(data));

        return callback();

      });

    });
  };

  // setDataHandler :: Handler
  var setDataHandler = callbackToHandler(function(err, res) {
    if (err) return callback(err);

    var data = getDataAsArray(res);

    return getQueue(fn_cache, key, getQueueHandler(data));
  });


  return setData(data_cache, key, res, setDataHandler);

}


var isWaiting = function(config, key, callback) {
  
  config.data_cache.get(key, function(err, res) {

    if (err) return callback(err);

    return callback(null, (res && Response.isWaiting(res)));

  });
};


var start = function(config, key, res, callback) {

  isWaiting(config, key, function(err, is_waiting) {

    if (err) return callback(err);

    res = Response.startWaiting(res);

    return setData(config.data_cache, key, res, callbackToHandler(callback));

  });

};


module.exports = function(fn_cache, data_cache) {

  var config = {
    fn_cache: fn_cache
  , data_cache: data_cache
  };

  return {
    add: add.bind(null, config)
  , get: get.bind(null, config)
  , dequeue: dequeue.bind(null, config)
  , start: start.bind(null, config)
  , isWaiting: isWaiting.bind(null, config)
  };
};
