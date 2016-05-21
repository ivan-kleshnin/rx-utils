# RxJS utils

High-level RxJS utils built to be used with bind operator (`::`, proposal stage).<br/>
Use library to increase readability and decrease code size for complex reactive dependencies.

`Observable` is aliased as `$` for brevity.

State examples imply [Functional Reducer](https://github.com/ivan-kleshnin/reactive-states#functional-reducer)
pattern being used.

API implies `$ u` type for `this` variable (`u` for "upstream").

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
$
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

### State

#### `store`

Canonical state reducer.

`scan(...)` + `distinctUntilChanged()` + `shareReplay(1)`

##### Example

```js
update::store(...)
```

#### `history`

Make observable of n last upstream values.

`this` + `scan` + `distinctUntilChanged()` + `shareReplay(1)`

##### Example

```js
state::history(...)
```

#### `derive`

Derive a state observable from a state observable.

`combineLatest(...)` + `distinctUntilChanged()` + `shareReplay(1)`

##### Example

```js
derive(...)
```

#### `deriveN`

Derive a state observable from state observables.

`this` + `combineLatest(...)` + `distinctUntilChanged()` + `shareReplay(1)`

##### Example

```js
deriveN(...)
```

### Lensing

#### `pluck`

Make an observable of fragments of upstream values.<br/>
Like native `.pluck` with nested path support.

##### Example

```js
intent::pluck("parentNode.dataset")
```

#### `pluckN`

Make an observable of a fragment of upstream values.

##### Example

```js
intent::pluckN(["parentNode.dataset1", "parentNode.dataset2"])
```

#### `view`

Make an observable of a state fragment.<br/>
`pluck(...)` + `distinctUntilChanged()` + `shareReplay(1)`

##### Example

```js
state::view("user.email")
```

#### `viewN`

Make an observable of state fragments.<br/>
`pluckN(...)` + `distinctUntilChanged()` + `shareReplay(1)`

##### Example

```js
state::viewN(["user.password", "user.passwordAgain"])
```

#### `toOverState : String, (u -> (sf -> sf)) -> $ (s -> s)`

Apply function to upstream value, apply resulting function to state fragment.

##### Example

```js
// createUser : $ User
createUser::toOverState("users", (u) => assoc(u.id, u))
// ==
// createUser : $ User
createUser.map((u) => (s) => assocPath(["users", u.id], u, s))
```

#### `toSetState : String, (sf -> sf) -> $ (s -> s)`

Apply function to upstream value, replace state fragment with resulting value.

##### Example

```js
// resetUsers : $ User
resetUsers::toSetState("users", (us) => map(..., us))
// ==
resetUsers.map((us) => (s) => assoc("users", map(..., us), s))
```

#### `overState : String, (sf -> sf) -> $ (s -> s)`

Apply function to state fragment. Upstream value does not matter.

```js
overState = function (path, fn) {}
```

##### Example

```js
// increment : $ Boolean
increment::overState("counter", (c) => c + 1)
// ==
increment.map((_) => (s) => assoc("counter", s.counter + 1, s))
```

#### `setState : String, v -> $ (s -> s)`

Replace state fragment with a value. Upstream value does not matter.

```js
setState = function (path, v) {}
```

##### Example

```js
// reset : $ Boolean
resetForm::setState("form", seedForm)
// ==
resetForm.map((_) => (s) => assoc("form", seedForm, s))
```

#### `toState : String -> $ (s -> s)`

Replace state fragment with upstream value.

```js
toState = function (path) {}
```

##### Example

```js
// changeUsername : $ String
changeUsername::toState("form.username"),
// ==
changeUsername.map((v) => (s) => assocPath(["form", "username"], v, s))
```

### Filtering & sampling

#### `filterBy`

Filter observable by another observable (true = keep).

##### Example

```js
intent::filterBy(...)
```

#### `rejectBy`

Filter observable by another observable (true = drop).

##### Example

```js
intent::rejectBy(...)
```

#### `at`

Pass upstream value futher if its fragment satisfies a predicate.

##### Example

```js
flags::at(...)::overState(...)
```

#### `atTrue`

Pass upstream value futher if its fragment is true.

##### Example

```js
flags::atTrue(...)::overState(...)
```

#### `atFalse`

Pass upstream value futher if its fragment is false.

##### Example

```js
flags::atFalse(...)::overState(...)
```

### Other

#### `render`

Apply a function over observable values in a glitch-free way.

##### Example

```js
let DOM = render(gameView, [state, derived.flags])
```
