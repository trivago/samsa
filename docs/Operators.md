# Operators

# Stream Operators

Samsa comes prepackaged with a few common operators that can be used to filter and transform the data in your stream. It also comes with the ability to store the date contained in your stream into a [data sink](#sink).

**Note:** Unless otherwise specified, the last argument to each callback is the encoding of the data, if it is present.

## map

Projects incoming data to a new value

| argument | description                                                |
| -------- | ---------------------------------------------------------- |
| project  | projection function that receives the data from the stream |

### usage

```js
streamOfNumbers.pipe(map(n => n * 2));
```

## filter

Removes data from the stream that does not pass the given predicate

| argument  | description                                               |
| --------- | --------------------------------------------------------- |
| predicate | predicate function that receives the data from the stream |

### usage

```js
streamOfNumbers.pipe(filter(n => n % 2 === 0));
```

## reduce

Reduce the incoming data to a single value.

**Note:** The value will not be passed until all data has been read

| argument    | description                                          |
| ----------- | ---------------------------------------------------- |
| accumulator | accumulator function that is run for each data point |
| initial     | the initial value of the accumulator                 |

### usage

```js
streamOfNumbers.pipe(reduce((acc, val) => acc + val, 0));
```

## scan

Similar to reduce, but returns the value being accumulated over time

| argument    | description                                          |
| ----------- | ---------------------------------------------------- |
| accumulator | accumulator function that is run for each data point |
| initial     | the initial value of the accumulator                 |

### usage

```js
stream.pipe(scan((acc, val) => acc + val, 0));
```

## skip

Skips the first `n` number of data chunks

| argument | description              |
| -------- | ------------------------ |
| toSkip   | number of values to skip |

### usage

```js
stream.pipe(skip(10));
```

## skipFirst

Skips the first chunk of data

| argument | description |
| -------- | ----------- |
|          |             |

### usage

```js
stream.pipe(skipFirst());
```

## tap

Peform some action or side effect related to the incoming data

| argument   | description                                                       |
| ---------- | ----------------------------------------------------------------- |
| sideEffect | side effect function that performs some side effect with the data |

### usage

```js
stream.pipe(tap(console.log));
```
