# Stream Combination Operators

-UNNAMED STREAM LIBRARY- comes with the ability to combine multiple streams into a single stream of data.

## merge

Merges 2 or more streams of data into a single stream.

| argument   | description                         |
| ---------- | ----------------------------------- |
| ...streams | a list of streams to merge together |

### Usage

```js
merge(stream1, stream2).pipe(...);
```

## join

<!-- Add a description here!! -->
<!-- especially explaining that it uses leveldb under the hood -->

| argument   | description                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------- |
| primary    | the stream containing primary keys                                                                |
| foreign    | the stream containing foreign keys                                                                |
| joinConfig | optional configuration for configuring the underlying storage mechanism for the two given streams |

### Supported join configuration options

`join` supports all configuration options from [sink](../operators/OPERATORS.md#sink), including:

| option     | defualt                                     | description |
| ---------- | ------------------------------------------- | ----------- |
| cachePath  | `.cache`                                    |             |
| cacheNames | `{ primary: "primary", foreign: "foreign"}` |             |
| caches     | `{primary: levelup, foreign: levelup}`      |             |

### Usage

```js
join(stream1, stream2).pipe(...);
```
