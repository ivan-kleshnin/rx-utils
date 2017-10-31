// Curry
export function curryN(N, fn) {
  let self = undefined;
  let collectFn = Object.defineProperties(function (...args) {
    if (this) {
      self = this;
    }
    if (args.length >= N) {
      return fn.apply(self, args);
    } else {
      return Object.defineProperties(function (...args2) {
        if (this) {
          self = this;
        }
        return collectFn.apply(self, args.concat(args2));
      }, {
        name: { value: fn.name + "_" + args.length },
        length: { value: N - args.length }
      });
    }
  }, {
    name: { value: fn.name },
    length: { value: N }
  });
  return collectFn;
}
export let curry = function (fn) {
  return curryN(fn.length, fn);
};

// Core Fn utils
export let id = x => x;
export let always = curry((x, y) => x);
export let complement = fn => (...args) => !fn(...args);

// Low-level helpers
export let fst = xs => xs[0];
export let keys = Object.keys;
export let merge = curry((xs, ys) => Object.assign({}, xs, ys));
export let range = curry((from, to) => {
  let rs = [];
  for (let i = from; i < to; i++) {
    rs.push(i);
  }
  return rs;
});
export let snd = xs => xs[1];
export let values = Object.values;

// High-level helpers
export let filter = curry((fn, xs) => xs.filter(fn));
export let isPlainObj = o => Boolean(o && o.constructor && o.constructor.prototype && o.constructor.prototype.hasOwnProperty("isPrototypeOf"));
export let flattenObj = (obj, keys = []) => {
  return Object.keys(obj).reduce((acc, key) => {
    return merge(acc, isPlainObj(obj[key]) ? flattenObj(obj[key], keys.concat(key)) : { [keys.concat(key).join(".")]: obj[key] });
  }, {});
};
export let map = curry((fn, xs) => xs.map(fn));
export let mapObjIndexed = curry((fn, obj) => {
  return reduce((z, k) => {
    z[k] = fn(obj[k], k, obj);
    return z;
  }, {}, keys(obj));
});
export let reduce = curry((fn, z, xs) => xs.reduce(fn, z));
export let zipObj = curry((keys, values) => {
  return reduce((z, i) => {
    z[keys[i]] = values[i];
    return z;
  }, {}, range(0, keys.length));
});