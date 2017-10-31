"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.chan = exports.mergeObjTracking = exports.combineLatestObj = exports.mergeObj = exports.passIfDown = exports.passIfUp = exports.passIfLow = exports.passIfHigh = undefined;

var _rxjs = require("rxjs");

var _helpers = require("./_helpers");

var R = _interopRequireWildcard(_helpers);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var sndComplement = R.complement(R.snd);

// Passes values from `a$` further when `b$` is truthy.
// passIfHigh :: Obs b -> Obs a -> Obs a
var passIfHigh = exports.passIfHigh = function passIfHigh(obs) {
  return function (self) {
    return self.withLatestFrom(obs).filter(R.snd).map(R.fst);
  };
};

// Passes values from `a$` instance further when `b$` is falsy.
// passIfLow :: Obs b -> Obs a -> Obs a
var passIfLow = exports.passIfLow = function passIfLow(obs) {
  return function (self) {
    return self.withLatestFrom(obs).filter(sndComplement).map(R.fst);
  };
};

// Passes values from `a$` further when `b$` is truthy, including the switch moment.
// passIfUp :: Obs b -> Obs a -> Obs a
var passIfUp = exports.passIfUp = function passIfUp(obs) {
  return function (self) {
    return self.combineLatest(obs).filter(R.snd).map(R.fst);
  };
};

// Passes values from `a$` further when `b$` is falsy, including the switch moment.
// passIfDown :: Obs b -> Obs a -> Obs a
var passIfDown = exports.passIfDown = function passIfDown(obs) {
  return function (self) {
    return self.combineLatest(obs).filter(sndComplement).map(R.fst);
  };
};

// Merges an object of streams to a stream of objects.
// mergeObj :: Object (Obs *) -> Obs *
var mergeObj = exports.mergeObj = function mergeObj(obj) {
  obj = R.flattenObj(obj);
  var values = R.values(obj); // streams
  return _rxjs.Observable.merge.apply(_rxjs.Observable, _toConsumableArray(values));
};

// Combines an object of streams to a stream of objects.
// combineLatestObj :: Object (Obs *) -> Obs *
var combineLatestObj = exports.combineLatestObj = function combineLatestObj(obj) {
  // a nicer analogy of https://github.com/staltz/combineLatestObj/blob/master/index.js
  var keys = R.keys(obj); // stream names
  var values = R.values(obj); // streams
  return _rxjs.Observable.combineLatest(values, function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return R.zipObj(keys, args);
  });
};

// Merges an object of streams to a stream of objects, keeping the original key data.
// mergeObjTracking :: Object (Obs *) -> Obs {key :: String, value :: *}
var mergeObjTracking = exports.mergeObjTracking = function mergeObjTracking(obj) {
  obj = R.mapObjIndexed(function (value, key) {
    return value.map(function (data) {
      return { key: key, data: data };
    });
  }, obj);
  var values = R.values(obj); // streams
  return _rxjs.Observable.merge.apply(_rxjs.Observable, _toConsumableArray(values));
};

// Makes a callable observable.
// chan :: (Obs a -> Obs b) -> Obs (State -> State)
// chan :: a -> Promise State
var chan = exports.chan = function chan(letFn) {
  var subj = new _rxjs.Subject();
  function bus() {
    for (var _len2 = arguments.length, callArgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      callArgs[_key2] = arguments[_key2];
    }

    if (callArgs.length <= 1) {
      subj.next(callArgs[0]); // no return value
    } else {
      subj.next(callArgs); // no return value
    }
  }
  var obs = letFn(subj);
  Object.setPrototypeOf(bus, obs); // support basic calls
  bus.apply = Function.prototype.apply; // support spreads
  return bus;
};