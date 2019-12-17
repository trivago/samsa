# Samsa

Samsa is a high level Node.js stream processing library inspired by other reactive streaming libraries like RxJS. The aim of Samsa is to provide the ability to transform, combine, and store data from Node.js streams without the need to write your own operators for everything.

## Features

-   Functional Node.js stream operators
-   Data sink connector, built on top of [LevelUp](https://github.com/level/levelup)
-   Kafka Stream consumers

## Usage

## Operators

Samsa offers many different operators designed to make working with your data easier. The most common operators are `map` `filter` `reduce`. A full listing of operators and how to create your own can be found in <!--add docs link here-->.

### Example

In this example, we are streaming a user data set, where we want to count the number of users above the age of 18.

```javascript
import { map, filter, reduce } from '@trivago/samsa';

userDataStream
    .pipe(map(getUsersAge))
    .pipe(filter(olderThan18)))
    .pipe(reduce(count, 0)

```

## Data Sink

The `sink` operator is offered as a way to quickly store any data that is stored in a stream as a key-value pair into any [AbstractLevelDown](https://github.com/Level/abstract-leveldown) compliant store. This could be LevelDB, a wrapped versioj of Redis, or xour own implementation, so long as it works with LevelUp.

In this example, we map a CSV stream to key-value pairs and then store it into a LevelDB instance for later retrieval.

```javascript
import level from "level";
import { sink, map } from "@trivago/samsa";

// create our sink database
const db = level("csv-sink");

csvStream
    // map our csv stream to a key value pairs
    .pipe(map(csvToKeyValuePair)
    // pipe our key-value pairs to our data sink
    .pipe(sink({ store: sink }));
```

## Usage with Kafka Streams

Samsa also works a stream processor for [Kafka Streams](https://kafka.apache.org/documentation/streams/). Though not a 1:1 port of the Kafka Streams, Samsa offers the ability to process, join, and store the streams in any [AbstractLevelDown](https://github.com/Level/abstract-leveldown) compliant store, such as [RedisDown](https://github.com/hmalphettes/redisdown).

```javascript
```
