# Operators

# Stream Operators

Samsa comes prepackaged with a few common operators that can be used to filter and transform the data in your stream.

## map

Projects incoming values to a new value

| argument | description                                       |
| -------- | ------------------------------------------------- |
| project  | projection function that transforms incoming data |

## filter

Removes values from a stream that do not satisfy the given predicate

| argument  | description                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------ |
| predicate | function that returns true for values that should be kept, and false for values that should be removed |

## reduce

Combine incoming data into a single value, returning the accumulated value after all data has been processed.

| argument    | description                                                             |
| ----------- | ----------------------------------------------------------------------- |
| accumulator | function run for each value in the stream. Signature: (acc, val) => val |
| initial     | the initial value for the accumulator                                   |

## scan

Combine incoming data into a single value over time, returning the accumulated value after each value in the stream has been processed.

| argument    | description                                                             |
| ----------- | ----------------------------------------------------------------------- |
| accumulator | function run for each value in the stream. Signature: (acc, val) => val |
| initial     | the initial value for the accumulator                                   |

## skip

Skips the first `n` number of values from the stream.

| argument | description              |
| -------- | ------------------------ |
| n        | number of values to skip |

## skipFirst

Skips the first value from the stream

## tap

Perform some action or side effect based on each value from the stream

| argument   | description                 |
| ---------- | --------------------------- |
| sideEffect | side effect to be performed |

## mergeMap

Map values to a new stream and continue reading from that stream.
