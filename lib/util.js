

const NoOp = function() {};


const tap = (fn) => (...args) =>
  Promise.resolve(fn.apply(null, args))

  .then(() => Promise.resolve.apply(Promise, args))
;


/* eslint-disable no-console */
const tapLog = (label) => tap(console.log.bind(console, label));
/* eslint-enable no-console */


const callbackResolver = (resolve, reject) => (err, ...rest) =>
  err ? reject(err) : resolve.apply(null, rest);


const tapCallback = (callback) => (...args) => {

  callback.apply(null, [null].concat(args));

  return args;

};


const attachCallback = (callback, promise) => {
  if (!callback) return promise;

  return promise
    .then(tapCallback(callback))
    .catch(callback);
}


module.exports = {
  NoOp
, tap
, tapLog
, callbackResolver
, attachCallback
}
