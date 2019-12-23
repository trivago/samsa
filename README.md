# Samsa

Samsa is a high level Node.js stream processing library inspired by other reactive streaming libraries like RxJS. The aim of Samsa is to provide the ability to transform, combine, and store data from Node.js streams without the need to write your own operators for everything.

## Features

-   Functional Node.js stream operators
-   Data sink connector, built on top of [LevelUp](https://github.com/level/levelup)
-   Kafka Stream consumers

## Usage

## Operators

Samsa offers many different operators designed to make working with your streams easier, the most common operators being `map`, `filter`, and `reduce`. A full listing of operators and how to create your own can be found in [Operators.md](./docs/Operators.md).

### Example

In this example, we are streaming a user data set, where we want to count the number of users above the age of 18.

```javascript
import { map, filter, reduce } from '@trivago/samsa';


const usersUnder18 = userDataStream
    // pluck the users age from the user data
    .pipe(map(getUsersAge))
    // filter out any that are under 18
    .pipe(filter(olderThan18)))
    // count the the users as they come through
    .pipe(reduce(count, 0)

// when reduce is finished, it will emit the total count.
usersUnder18.on('data', console.log)

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

Samsa also works a stream processor for [Kafka](https://kafka.apache.org/). Though not a 1:1 port of the Kafka Streams, Samsa offers the ability to process, join, and store the streams in any [AbstractLevelDown](https://github.com/Level/abstract-leveldown) compliant store, such as [RedisDown](https://github.com/hmalphettes/redisdown).

At the moment Samsa exports the function `createCosnumerStream` which wraps batches from [KakfaJS](https://github.com/tulios/kafkajs). More information can be found in [Kafka.md](./docs/Kafka.md).

```javascript
import { createConsumerStream } from '@trivago/samsa/kafka';
import { filter, sink } from '@trivago/samsa';

const consumerStream = createConsumerStream(
    // kafka client configuration
    // required: a list of brokers
    {
        brokers: [...],

    },
    // consumer configuration
    // required: topic, groupId
    {
        topic: 'my-topic',
        groupId: 'my-group-id-randomhash'
    }
);

consumerStream
    .pipe(filter(nonRelevantData))
    .pipe(sink('my-levelupp-stream-storage))

```
