# DataSink

Samsa comes with an interface for storing **keyed** data into a data store for easy retrieval later. `sink` is a `writable stream` that uses [LevelUp](https://github.com/Level/levelup) to store data into any given store. This works by accepting any store that is compliant to the AbstractLevelDOWN contract and could potentially be any kind of store.

## Configuration Options

| option        | type                               | default          | description                                                                                                              |
| ------------- | ---------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| store         | LevelUp, AbstractLevelDOWN, string | `sink-{counter}` | The store used by sink. If a string is passed, an instance of LevelDB with the name of `sink-{counter}` will be created. |
| batchSize     | number                             | 1e5              | determines the number of objects to batch before storing them                                                            |
| batchAge      | number                             | 300              | determines how long objects should be held in a batch before being stored                                                |
| highWaterMark | number                             | 5e5              | from Node stream land, determines the number of objects to be stored in memory before pausing the `sink`                 |

## Usage

In this example, we are storing user data to a redis store for easy retrieval.

[More information about redisdown](https://github.com/hmalphettes/redisdown).

```javascript
import { sink } from '@trivago/samsa';
import levelup from 'levelup';
import redisDown from "redisdown";
import Redis from "ioredis";

const redisClient = new Redis(...);

const redisStore = levelup(redisDown("user-store"), { redis: redisClient });

userStream.pipe(sink(redisStore));
```
