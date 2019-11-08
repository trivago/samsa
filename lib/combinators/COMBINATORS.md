# Stream Combination Operators

-UNNAMED STREAM LIBRARY- comes with the ability to combine multiple streams into a single stream of data, by merging or joining those streams.

## merge

Merges 2 or more streams of data into a single stream.

| argument   | description                         |
| ---------- | ----------------------------------- |
| ...streams | a list of streams to merge together |

### Usage

Using streams that are pass their value as soon fast as possible, you may notice a concatenation like behavior.

```js
// 1,2,3
const stream1 = createFastStream();
// 1,2,3
const stream2 = createFastStream();

// 1,2,3,1,2,3
merge(stream1, stream2).pipe(...);
```

Using streams that take some time to pass their values

```js
// 1,2,3
const stream1 = createSlowStream();
// 1,2,3
const stream2 = createSlowStream();

// 1,1,2,2,3,3
merge(stream1, stream2).pipe(...);
```

## join

Joins 2 **keyed** streams together by key, returning the key and values once a value from both streams has been received.

<!-- Add a description here!! -->
<!-- especially explaining that it uses leveldb under the hood -->

This operator uses LevelDB under the hood to handle the caching of incoming values. This can be changed by passing a `primary` and a `foreign` LevelUp database to the `caches` configuration.

| argument   | description                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------- |
| primary    | the stream containing primary keys                                                                |
| foreign    | the stream containing foreign keys                                                                |
| joinConfig | optional configuration for configuring the underlying storage mechanism for the two given streams |

### Supported join configuration options

`join` supports all configuration options from [sink](../operators/OPERATORS.md#sink), including:

| option     | defualt                                     | description                                                                         |
| ---------- | ------------------------------------------- | ----------------------------------------------------------------------------------- |
| cachePath  | `.cache`                                    | optional, path to where to store the internal cache                                 |
| cacheNames | `{ primary: "primary", foreign: "foreign"}` | optional, names to use for the caches                                               |
| caches     | `{primary: levelup, foreign: levelup}`      | optional, levelup stores to use instead of LevelDB, overriding other options passed |

### Usage

```js
// [{key: 1, value: 1}, {key: 2, value: 2}]
const stream1 = ...
// [{ key: 1, value: 1}, {key:2, value: 2}]
const stream2 = ...

// [{key: 1, primary: 1, foreign: 1}, { key: 2, primary: 2, foreign: 2}]
join(stream1, stream2).pipe(...)
```

<!-- TODO: -->
<!-- ## concat -->
