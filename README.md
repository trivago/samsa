<!-- # Samsa

Samsa is built for making working with, combining, and storing keyed streams of data as ergonomically as possible.

## Features

-   Stream operators for transforming and filtering data
-   Stream combinators for combining streams
-   Date Sink connector creationg built on top of [LevelUp](https://github.com/level/levelup)
-   Creation for common kinds of streams

## Documentation

-   [Stream Operators](./lib/operators/OPERATORS.md)
-   [Stream Combination](./lib/combinators/COMBINATORS.md)
-   [Data Sink](./lib/operators/OPERATORS.md#sink)
-   [Kafka Streams](./lib/operators/KAFKA.md) -->

# Samsa

Samsa is a high level Node.js stream processing library inspired by other reactive streaming libraries like RxJS. The aim of Samsa is to provide the ability to transform, combine, and store data from Node.js streams without the need to write your own operators for everything.

## Features

-   Functional Node.js stream operators
-   Data sink connector, built on top of [LevelUp](https://github.com/level/levelup)
-   Kafka Stream consumers

## Usage

```javascript


```

## Operators

Samsa offers many different operators designed to make working with your data easier. The most common operators are `map` `filter` `reduce`. A full listing of operators and how to create your own can be found in <!--add docs link here-->.

### Example

## Data Sink

The `sink` operator is offered as a way to quickly store any data that is stored in a stream as a key-value pair into any [AbstractLevelDown](https://github.com/Level/abstract-leveldown) compliant store. This could be LevelDB, a wrapped versioj of Redis, or xour own implementation, so long as it works with LevelUp.

```javascript

```

## Usage with Kafka Streams

Samsa also works a stream processor for [Kafka Streams](https://kafka.apache.org/documentation/streams/). Though not a 1:1 port of the Kafka Streams, Samsa offers the ability to process, join, and store the streams in any [AbstractLevelDown](https://github.com/Level/abstract-leveldown) compliant store, such as [RedisDown](https://github.com/hmalphettes/redisdown). 

```javascript

```


