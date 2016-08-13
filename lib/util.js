
// isArray :: a -> Bool
isArray = function(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
}


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
, handlerToCallback: handlerToCallback
, callbackToHandler: callbackToHandler
}
