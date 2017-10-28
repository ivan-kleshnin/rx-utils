# RxJS utils

High-level RxJS operators.

#### Legend

```
stateless stream: --x--y-->
stateful stream:  ==x==y==>
```

Stateless stream is a stream of events. Stateful stream is a stream of data having the value "between"
the events. Stateful streams in RxJS can be made by `statelessStream.shareReplay(1)`.

#### Dependencies

* RxJS (peer)

Here and below `Rx.Observable` type may be aliased as `Obs` and its instances as `O` for brevity.

## API

#### `passIfHigh :: Obs b -> Obs a -> Obs a`

Passes values from `a$` further when `b$` is truthy.

Example: TODO

#### `passIfLow :: Obs b -> Obs a -> Obs a`

Passes values from `a$` instance further when `b$` is falsy.

Example: TODO

#### `passIfUp :: Obs b -> Obs a -> Obs a`

Passes values from `a$` further when `b$` is truthy, including the switch moment.

Example: TODO

#### `passIfDown :: Obs b -> Obs a -> Obs a`

Passes values from `a$` further when `b$` is falsy, including the switch moment.

Example:

```js
state
  .let(passIfDown(lock))

// lock:   1==========0=========>
// state:  ---s1---s2------s3--->
// result: -----------s2---s3--->
```

#### `mergeObj :: Object (Obs *) -> Obs *`

Merges an object of streams to a stream of objects.

Example:

```js
// Describe reactive state declaratively
let actions = {
  inc: O.of(c => c + 1).delay(1000),
  dec: O.of(c => c - 1).delay(2000),
}

let state = mergeObj(actions)
 .startWith(seed)
 .scan((state, fn) => fn(state))
 .shareReplay(1)

// inc:   ------f------->
// dec:   ----------f--->
// state: 0=====1===0===>
```

#### `combineLatestObj :: Object (Obs *) -> Obs *`

Combines an object of streams to a stream of objects.

Example:

```js
// Update React(-like) props whenever stateful streams change
let streamsToProps = {
  counterX: db$.pluck("counterX"),
  counterY: db$.pluck("counterY"),
}

combineLatestObj(streamsToProps)
  .throttleTime(10)
  .subscribe((data) => {
    this.setState(data)
  })

// counterX: ===x1========x2===>
// counterY: ========y1========>
// result:   ---!----!----!---->
```

#### `mergeObjTracking :: Object (Obs *) -> Obs {key :: String, value :: *}`

Merges an object of streams to a stream of objects, keeping the original key data.

Example:

```js
// Track the actions
let actions = {
  add: O.of(1, 2).concatMap((fn, i) => O.of(fn).delay(1000)),
  sub: O.of(3, 4).delay(2000).concatMap((fn, i) => O.of(fn).delay(1000)),
}

let track = mergeObjTracking(actions)
track.subscribe(pack => {
  console.log(pack.key + "(" + pack.data + ")")
})

// add(1)
// add(2)
// sub(3)
// sub(4)
```

#### `chan :: (Obs a -> Obs b) -> Obs (a -> b)`

Overloaded: `chan :: a -> ()`

Makes a callable observable.

Example: TODo

## License

MIT
