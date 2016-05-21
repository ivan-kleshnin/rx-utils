let R = require("ramda")
let {append, curry, identity, is, map, not, repeat, split, takeLast} = require("ramda")
let memoize = require("memoizee")
let {Observable: $} = require("rx")

// HELPERS =========================================================================================

// String -> Lens
let lens = curry((path) => {
  return path ?
    R.lensPath(split(".", path)) :
    R.lensPath([])
})

// a -> b -> a
let always = curry((x, y) => x)

// [a] -> a
let fst = (xs) => xs[0]

// [a] -> a
let snd = (xs) => xs[1]

// s -> (s -> s) -> s
let scanFn = curry((state, updateFn) => {
  if (!is(Function, updateFn) || updateFn.length != 1) {
    throw Error("updateFn must be a function with arity 1, got " + updateFn)
  } else {
    return updateFn(state)
  }
})

// LIBRARY =========================================================================================

// Lensing

// Make an observable of fragments of upstream values.
// $ a, String -> $ b
let pluck = function (path) {
  let ls = lens(path)
  return this.map((v) => R.view(ls, v)).share()
}

// Make an observable of a fragment of upstream values.
// $ a, [String] -> $ b
let pluckN = function (paths) {
  let lss = map(lens, paths)
  return this.map((v) => map((ls) => R.view(ls, v), lss)).share()
}

// Make an observable of a state fragment.
// $ a, String -> $ b
let view = memoize(function (path) {
  let ls = lens(path)
  return this
    .map((v) => R.view(ls, v))
    .distinctUntilChanged()
    .shareReplay(1)
})

// Make an observable of state fragments.
// $ a, [String] -> $ b
let viewN = memoize(function (paths) {
  let lss = map(lens, paths)
  return this
    .map((v) => map((ls) => R.view(ls, v), lss))
    .distinctUntilChanged()
    .shareReplay(1)
})

// Apply function to upstream value, apply resulting function to state fragment.
// $ uv, String, (uv -> (sv -> sv)) -> $ fn
let toOverState = function (path, fn) {
  let ls = lens(path)
  return this.map((v) => (s) => R.over(ls, fn(v), s))
}

// Apply function to upstream value, replace state fragment with resulting value.
// $ uv, String, (sf -> sf) -> $ (s -> s)
let toSetState = function (path, fn) {
  let ls = lens(path)
  return this.map((v) => (s) => R.set(ls, fn(v), s))
}

// Apply function to state fragment.
// $ u, String, (sf -> sf) -> $ (s -> s)
let overState = function (path, fn) {
  return this::toOverState(path, always(fn))
}

// Replace state fragment with a value. Upstream value does not matter.
// $ u, String, v -> $ (s -> s)
let setState = function (path, v) {
  return this::toSetState(path, always(v))
}

// Replace state fragment with upstream value.
// $ u, String -> $ (s -> s)
let toState = function (path) {
  return this::toSetState(path, identity)
}

// State

// Canonical state reducer.
// s -> $ (s -> s) -> $ s
let store = curry((seed, update) => {
  return update
    .startWith(seed)
    .scan(scanFn)
    .distinctUntilChanged()
    .shareReplay(1)
})

// Derive a state observable from a state observable
// (a -> b) -> $ a -> $ b
let derive = curry((deriveFn, os) => {
  return deriveN(deriveFn, [os])
})

// Derive a state observable from state observables.
// (* -> b) -> [$ *] -> $ b
let deriveN = curry((deriveFn, os) => {
  return $.combineLatest(...os, deriveFn).distinctUntilChanged().shareReplay(1)
})

// Make observable of n last upstream values.
// $ s, Number -> $ [s]
let history = function (n) {
  if (n <= 0) {
    throw Error("n must be an unsigned integer, got "+ String(n))
  }
  return this.scan((stateHistory, newState) => {
    return takeLast(n, append(newState, stateHistory))
  }, repeat(null, n))
    .distinctUntilChanged()
    .shareReplay(1)
}

// Filtering

// Filter observable by another observable (true = keep).
// $ a, $ Boolean -> $ a
let filterBy = function (o) {
  return this.withLatestFrom(o).filter(snd).map(fst)
}

// Filter observable by another observable (true = drop).
// $ a, $ Boolean -> $ a
let rejectBy = function (o) {
  return this::filterBy(o.map(not))
}

// Pass upstream value futher if its fragment satisfies a predicate.
// $ a, String, v -> $ a
let at = function (path, filterFn) {
  return this.sample(this::pluck(path).filter(filterFn))
}

// Pass upstream value futher if it's fragment is true.
// $ a, String -> $ a
let atTrue = function (path) {
  return this::at(path, identity)
}

// Pass upstream value futher if its fragment is false.
// $ a, String -> $ a
let atFalse = function (path) {
  return this::at(path, not(identity))
}

// Other

// Apply a function over observable values in a glitch-free way.
// (... -> a), [$ *] -> $ a
let render = curry((viewFn, os) => {
  return $
    .combineLatest(...os)
    .debounce(1)
    .map((args) => viewFn(...args))
})

// EXPORTS =========================================================================================

// Helpers
exports.scanFn = scanFn

// State viewers
exports.pluck = pluck
exports.pluckN = pluckN
exports.view = view
exports.viewN = viewN
exports.derive = derive
exports.deriveN = deriveN

// State core
exports.store = store
exports.history = history

// State modifiers
exports.toOverState = toOverState
exports.toSetState = toSetState
exports.overState = overState
exports.setState = setState
exports.toState = toState

// Filtering
exports.filterBy = filterBy
exports.rejectBy = rejectBy
exports.at = at
exports.atTrue = atTrue
exports.atFalse = atFalse

// Other
exports.render = render
