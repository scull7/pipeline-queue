

// set :: Store -> Key -> Function -> Queue
const set = (store, key, fn) => {
  let queue = get(store, key);
  store[key] = queue.concat([ fn ]);

  return store[key];
};


// get :: Store -> String -> Queue
const get = (store, key) => store.hasOwnProperty(key) ? store[key] : [];


// del :: Store -> String -> Bool
const del = (store, key) => {
  delete store[key];

  return true;
};


module.exports = () => {

  const store = {};

  return {
    set: set.bind(null, store)
  , get: get.bind(null, store)
  , del: del.bind(null, store)
  };

};
