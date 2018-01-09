"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.curryN = curryN;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Curry
function curryN(N, fn) {
  var self = undefined;
  var collectFn = Object.defineProperties(function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (this) {
      self = this;
    }
    if (args.length >= N) {
      return fn.apply(self, args);
    } else {
      return Object.defineProperties(function () {
        if (this) {
          self = this;
        }

        for (var _len2 = arguments.length, args2 = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args2[_key2] = arguments[_key2];
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
var curry = exports.curry = function curry(fn) {
  return curryN(fn.length, fn);
};

// Core Fn utils
var id = exports.id = function id(x) {
  return x;
};
var always = exports.always = curry(function (x, y) {
  return x;
});
var complement = exports.complement = function complement(fn) {
  return function () {
    return !fn.apply(undefined, arguments);
  };
};

// Low-level helpers
var fst = exports.fst = function fst(xs) {
  return xs[0];
};
var keys = exports.keys = Object.keys;
var merge = exports.merge = curry(function (xs, ys) {
  return Object.assign({}, xs, ys);
});
var range = exports.range = curry(function (from, to) {
  var rs = [];
  for (var i = from; i < to; i++) {
    rs.push(i);
  }
  return rs;
});
var snd = exports.snd = function snd(xs) {
  return xs[1];
};
var values = exports.values = Object.values;

// High-level helpers
var filter = exports.filter = curry(function (fn, xs) {
  return xs.filter(fn);
});
var isPlainObj = exports.isPlainObj = function isPlainObj(o) {
  return Boolean(o && o.constructor && o.constructor.prototype && o.constructor.prototype.hasOwnProperty("isPrototypeOf"));
};
var flattenObj = exports.flattenObj = function flattenObj(obj) {
  var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  return Object.keys(obj).reduce(function (acc, key) {
    return merge(acc, isPlainObj(obj[key]) ? flattenObj(obj[key], keys.concat(key)) : _defineProperty({}, keys.concat(key).join("."), obj[key]));
  }, {});
};
var map = exports.map = curry(function (fn, xs) {
  return xs.map(fn);
});
var mapObjIndexed = exports.mapObjIndexed = curry(function (fn, obj) {
  return reduce(function (z, k) {
    z[k] = fn(obj[k], k, obj);
    return z;
  }, {}, keys(obj));
});
var reduce = exports.reduce = curry(function (fn, z, xs) {
  return xs.reduce(fn, z);
});
var zipObj = exports.zipObj = curry(function (keys, values) {
  return reduce(function (z, i) {
    z[keys[i]] = values[i];
    return z;
  }, {}, range(0, keys.length));
});