
var util              = require('./util.js');
var handlerToCallback = util.handlerToCallback;
var callbackToHandler = util.callbackToHandler;


// queueAddOrNew :: FunctionQueue -> UserCallback -> FunctionQueue
var queueAddOrNew = function(queue, user_callback) {
  return queue ? queue.concat([ user_callback ]) : [ user_callback ];
}


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
setData = function(data_cache, key, data, handler) {
  data = util.isArray(data) ? data : [ data ];

  return data_cache.set(key, data, handlerToCallback(handler));
};


// add :: Config -> String -> UserCallback -> Callback -> void
var add = function(config, key, user_callback, callback) {

  var handler = callbackToHandler(callback);

  return saveHandler(config.fn_cache, key, user_callback, handler);
};


// get :: Config -> String -> Callback -> void
var get = function(config, key, callback) {
  return config.fn_cache.get(key, callback);
};


// dequeue :: Config -> String -> Response -> Callback -> void
var dequeue = function(config, key, response, callback) {
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

        queue.forEach(runner(data));

        return callback();

      });

    });
  };

  // setDataHandler :: Handler
  var setDataHandler = callbackToHandler(function(err, data) {
    if (err) return callback(err);

    return getQueue(fn_cache, key, getQueueHandler(data));
  });


  return setData(data_cache, key, response, setDataHandler);

}


module.exports = function(fn_cache, data_cache) {

  var config = {
    fn_cache: fn_cache
  , data_cache: data_cache
  };

  return {
    add: add.bind(null, config)
  , get: get.bind(null, config)
  , dequeue: dequeue.bind(null, config)
  };
};
