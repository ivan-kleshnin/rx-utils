# RxJS utils

High-level RxJS utils built to be used with bind operator (`::`, proposal stage).<br/>
Use library to increase readability and decrease code size for complex reactive dependencies.

#### Sample 1

```js
derived.flags
  .sample(derived.flags.map((fs) => fs.winGame)
  .filter(identity)).map((_) => (s) => assoc("ended", "win", s))

// =>

derived.flags
  ::atTrue("winGame")
  ::setState("ended", "win")
```

#### Sample 2

```js
Observable
  .combineLatest(src.navi, state2, derived.flags)
  .debounce(1)
  .map([src.navi, state2, derived.flags], gameView)

// =>

render(gameView, [src.navi, state2, derived.flags]),
```

#### Sample 3

```js
let errors = store(seeds, $.merge(
  state.map((s) => s.user.points).skip(1).map((x) => validate(Points)).map((p) => (s) => assocPath(["user", "points"], p, s)),
  state.map((s) => s.user.bonus).skip(1).map((x) => validate(Bonus)).map((p) => (s) => assocPath(["user", "points"], p, s))
))

// =>

let errors = store(seeds, $.merge(
  state::view("user.points").skip(1).map((x) => validate(Points))::toState("user.points"),
  state::view("user.bonus").skip(1).map((x) => validate(Bonus))::toState("user.bonus")
))
```

## Use

```
$ npm install babel-preset-es2016 --save
$ npm install babel-plugin-syntax-function-bind --save
$ npm install babel-plugin-transform-function-bind --save
```

Put

```json
{
  "plugins": [
    "syntax-function-bind",
    "transform-function-bind"
  ],
  "presets": [
    "es2016"
  ]
}
```

into `.babelrc`.

## Install

```
$ npm install rx-utils
```

## API

### Lensing

#### `pluck`

Make an observable of fragments of upstream values.<br/>
Like native `.pluck` with nested path support.

Example

```js
intent::pluck("parentNode.dataset")
```

#### `pluckN`

Make an observable of a fragment of upstream values.

Example

```js
intent::pluckN(["parentNode.dataset1", "parentNode.dataset2"])
```

#### `view`

Make an observable of a state fragment.<br/>
`pluck(...)` + `distinctUntilChanged()` + `shareReplay(1)`

Example

```js
state::view("user.email")
```

#### `viewN`

Make an observable of state fragments.<br/>
`pluckN(...)` + `distinctUntilChanged()` + `shareReplay(1)`

Example

```js
state::viewN(["user.password", "user.passwordAgain"])
```

#### `toOverState`

Apply function to upstream value, apply resulting function to state fragment.

Example

```js
action::toOverState(...)
```

#### `toSetState`

Apply function to upstream value, replace state fragment with resulting value.

Example

```js
action::toSetState(...)
```

#### `overState`

Apply function to state fragment.

Example

```js
action::overState(...)
```

#### `setState`

Replace state fragment with an argument value.

Example

```js
action::setState(...)
```

#### `toState`

Replace state fragment with upstream value.

Example

```js
action::toState(...)
```

### State

#### `store`

Canonical state reducer.

`scan(...)` + `distinctUntilChanged()` + `shareReplay(1)`

Example

```js
update::store(...)
```

#### `derive`

Derive a state observable from a state observable.

`combineLatest(...)` + `distinctUntilChanged()` + `shareReplay(1)`

Example

```js
derive(...)
```

#### `deriveN`

Derive a state observable from state observables.

`this` + `combineLatest(...)` + `distinctUntilChanged()` + `shareReplay(1)`

Example

```js
deriveN(...)
```

#### `history`

Make observable of n last upstream values.

`this` + `scan` + `distinctUntilChanged()` + `shareReplay(1)`

Example

```js
state::history(...)
```

### Filtering & Sampling

#### `filterBy`

Filter observable by another observable (true = keep).

Example

```js
intent::filterBy(...)
```

#### `rejectBy`

Filter observable by another observable (true = drop).

Example

```js
intent::rejectBy(...)
```

#### `at`

Pass upstream value futher if its fragment satisfies a predicate.

Example

```js
flags::at(...)::overState(...)
```

#### `atTrue`

Pass upstream value futher if its fragment is true.

Example

```js
flags::atTrue(...)::overState(...)
```


#### `atFalse`

Pass upstream value futher if its fragment is false.

Example

```js
flags::atFalse(...)::overState(...)
```

### Other

#### `render`

Apply a function over observable values in a glitch-free way.

Example

```js
let DOM = render(gameView, [state, derived.flags])
```
