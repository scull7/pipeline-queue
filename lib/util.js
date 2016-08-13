
isArray = function(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
}

module.exports = {
  isArray : (Array.isArray) ? Array.isArray : isArray
}
