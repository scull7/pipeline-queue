
const { attachCallback } = require('./util.js');
const CacheWrapper       = require('./cache-wrapper.js');
const Response           = require('./response.js');


// getDataAsArray :: Response -> Array a
const getDataAsArray = (res) => {
  const data = Response.getData(res);

  return Array.isArray(data) ? data : [ data ];
}


// add :: Config -> String -> UserCallback -> Callback -> void
const add = (config, key, user_callback, callback) => {
  
  const { FnCache, DataCache } = config;

  FnCache.set(key, user_callback);

  return attachCallback(callback, DataCache.get(key).then((res) => {
    
    if (res && Response.isAlive(res)) {
      return dequeue(config, key, res);
    }

    return FnCache.get(key);

  }));
};


// get :: Config -> String -> Callback -> void
const get = ({ FnCache }, key, callback) => attachCallback(callback,
  Promise.resolve(FnCache.get(key))
);


// dequeue :: Config -> String -> Response -> Callback -> void
const dequeue = ({ FnCache, DataCache }, key, res, callback) => {

  if (!Response.isAlive(res))
    throw new Error('Cannot de-queue with a dead response object');

  const runner = (data) => (element) => element.apply(null, data);
  const queue  = FnCache.get(key);

  FnCache.del(key);

  return attachCallback(callback, 
    DataCache.set(key, res)
    .then(getDataAsArray)
    .then((data) => {
      if (queue) queue.forEach(runner(data));
      return data;
    })
  );

};


// isWaiting :: Config -> String -> Callback -> Promise Bool
const isWaiting = ({ DataCache }, key, callback) => attachCallback(callback,
  DataCache.get(key).then((res) => res && Response.isWaiting(res))
);


// start :: Config -> String -> Response -> Callback -> Promise Response
const start = (config, key, res, callback) => attachCallback(callback,
  isWaiting(config, key)
    .then((is_waiting) => {
      if (is_waiting) throw new Error('Cannot start already started task')
      return res
    })
    .then(Response.startWaiting)
    .then(config.DataCache.set.bind(null, key))
);


module.exports = function(fn_cache, data_cache) {

  var config = {
    FnCache: fn_cache
  , DataCache: CacheWrapper(data_cache)
  };

  return {
    add: add.bind(null, config)
  , get: get.bind(null, config)
  , dequeue: dequeue.bind(null, config)
  , start: start.bind(null, config)
  , isWaiting: isWaiting.bind(null, config)
  };
};
