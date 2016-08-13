
// isArray :: a -> Bool
var isArray = function(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
}


var noop = function() {};


// handlerToCallback :: Handler -> Callback
var handlerToCallback = function(handler) {
  return function(err) {

    if (err) return handler.onError(err);

    var args = Array.prototype.slice.call(arguments, 1);

    return handler.onSuccess.apply(null, args);

  };
};


// callbackToHandler :: Callback -> Handler
var callbackToHandler = function(callback) {

  if (!callback) callback = noop;

  return  {
    onError: callback
  , onSuccess: function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(null);

      return callback.apply(null, args);
    }
  };
};


module.exports = {
  isArray : (Array.isArray) ? Array.isArray : isArray
, noop: noop
, handlerToCallback: handlerToCallback
, callbackToHandler: callbackToHandler
}
