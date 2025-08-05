/**
 * Utility function to combine class names.
 * @param {...(string|Object|null|undefined)} inputs
 * @returns {string}
 */
export function cn() {
  var classes = [];
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if (arg) {
      var argType = typeof arg;
      if (argType === 'string' || argType === 'number') {
        classes.push(arg);
      } else if (Object.prototype.toString.call(arg) === '[object Object]') {
        for (var key in arg) {
          if (arg.hasOwnProperty(key) && arg[key]) {
            classes.push(key);
          }
        }
      }
    }
  }
  return classes.join(' ');
}
