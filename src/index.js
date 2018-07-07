import defaults from './defaults';
import Netop from './core/Netop';

/**
 * Create a instance of Netop
 * @param {Object} [config]
 * @return {Netop}
 */
export default function netop(config) {
  const init = Object.assign({}, defaults);
  config && Object.assign(init, config);
  init.adapter = init.adapter || defaults.adapter;
  return new Netop(init);
}

netop.Netop = Netop;
netop.defaults = defaults;

netop.all = function all(...promises) {
  return Promise.all(promises);
};

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  netop.spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
netop.spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};
