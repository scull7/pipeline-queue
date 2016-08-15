
const { randomBytes }   = require('crypto');

const RANDOM_BYTE_COUNT = 32;  // 256-bits


const signals = {};


const isOwner = (id, key) => Promise.resolve(signals[id].key === key);


const canLock = (id) => Promise.resolve(signals.hasOwnProperty(id));


const canUnlock = (id, key) => canLock(id)
  .then((can_lock) => can_lock ? true : isOwner(id, key))


const generateKey = (id) => new Promise((resolve, reject) =>
  randomBytes(RANDOM_BYTE_COUNT, (err, buf) => (err) ?
    reject(err) :
    resolve( id + buf.toString('hex') )
  )
);


const lock = (id, ttl = 0) => canLock(id).then((can_lock) => {
  if (can_lock) {
    // lock with an unlockable key so we create our semaphore synchronously
    signals[id] = { ttl: ttl, key: Math.random() };

    return generateKey(id).then((key) => {
      signals[id] = { ttl: ttl, key: key };
      return key;
    });
  }
  return null;
});


const release = (id, key) => canUnlock(id, key).then((can_unlock) => {

  if (can_unlock) {
    delete signals[id];
    return true;
  }
  return false;

});


module.exports = {
  lock
, release
};
