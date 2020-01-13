# Stream creators

Samsa comes prepacked with the ability to create some basic streams.

## of

Emits the given values in sequence.

| argument  | description        |
| --------- | ------------------ |
| ...values | the values to emit |

## from

Turns an array, promise, or any iterable into a stream.

| argument | description                     |
| -------- | ------------------------------- |
| ish      | the array, promise, or iterable |

## interval

Creates a stream that emits a value based on the given interval in milliseconds.

| argument | description                                |
| -------- | ------------------------------------------ |
| time     | time in milliseconds between each emission |

## range

Creates a stream that emits the values between `min` and `max` inclusive.

| argument | description               |
| -------- | ------------------------- |
| min      | the minimum value to emit |
| max      | the maximum value to emit |
