import {Observable as O, Subject as S} from "rxjs"
import * as R from "./_helpers"

let sndComplement = R.complement(R.snd)

// Passes values from `a$` further when `b$` is truthy.
// passIfHigh :: Obs b -> Obs a -> Obs a
export let passIfHigh = (obs) => (self) => {
  return self.withLatestFrom(obs).filter(R.snd).map(R.fst)
}

// Passes values from `a$` instance further when `b$` is falsy.
// passIfLow :: Obs b -> Obs a -> Obs a
export let passIfLow = (obs) => (self) => {
  return self.withLatestFrom(obs).filter(sndComplement).map(R.fst)
}

// Passes values from `a$` further when `b$` is truthy, including the switch moment.
// passIfUp :: Obs b -> Obs a -> Obs a
export let passIfUp = (obs) => (self) => {
  return self.combineLatest(obs).filter(R.snd).map(R.fst)
}

// Passes values from `a$` further when `b$` is falsy, including the switch moment.
// passIfDown :: Obs b -> Obs a -> Obs a
export let passIfDown = (obs) => (self) => {
  return self.combineLatest(obs).filter(sndComplement).map(R.fst)
}

// Merges an object of streams to a stream of objects.
// mergeObj :: Object (Obs *) -> Obs *
export let mergeObj = (obj) => {
  obj = R.flattenObj(obj)
  let values = R.values(obj) // streams
  return O.merge(...values)
}

// Combines an object of streams to a stream of objects.
// combineLatestObj :: Object (Obs *) -> Obs *
export let combineLatestObj = (obj) => {
  // a nicer analogy of https://github.com/staltz/combineLatestObj/blob/master/index.js
  let keys = R.keys(obj)     // stream names
  let values = R.values(obj) // streams
  return O.combineLatest(values, (...args) => {
    return R.zipObj(keys, args)
  })
}

// Merges an object of streams to a stream of objects, keeping the original key data.
// mergeObjTracking :: Object (Obs *) -> Obs {key :: String, value :: *}
export let mergeObjTracking = (obj) => {
  obj = R.mapObjIndexed((value, key) => {
    return value.map(data => ({key, data}))
  }, obj)
  let values = R.values(obj) // streams
  return O.merge(...values)
}

// Makes a callable observable.
// chan :: (Obs a -> Obs b) -> Obs (State -> State)
// chan :: a -> Promise State
export let chan = (letFn) => {
  let subj = new S()
  function bus(...callArgs) {
    if (callArgs.length <= 1) {
      subj.next(callArgs[0]) // no return value
    }
    else {
      subj.next(callArgs) // no return value
    }
  }
  let obs = letFn(subj)
  Object.setPrototypeOf(bus, obs)      // support basic calls
  bus.apply = Function.prototype.apply // support spreads
  return bus
}
