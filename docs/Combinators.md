# Stream Combination Operators

Samsa comes with the ability to combine multiple streams into a single stream of data, by merging or joining those streams.

## merge

Merges 2 or more streams of data into a single stream.

| argument   | description                         |
| ---------- | ----------------------------------- |
| ...streams | a list of streams to merge together |

### Usage

## innerJoin / join

`join` and `innerJoin` both join two **keyed** streams together and emits when a value from both streams exists. This combinator also offers:

-   projecting the joined values as they are emitted
-   sliding time window joins

| argument     | description                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| primary      | the stream containing primary keys                                                                            |
| foreign      | the stream containing foreign keys                                                                            |
| project      | the projection used to map the primary and foreign values together, defaults to return `{ primary, foreign }` |
| window       | the amount of time in seconds to keep cached values alive, defaults to `0`                                    |
| KTableConfig | takes a `batchSize` and `batchAge` to determine how often the given streams are cached                        |

Underlying every join is a `KTable`, which in this case is a key-value cache. The `KTable` uses an instance of `LevelDB` to store and retrieve data from the cache in a reasonable manner. In a Kafka context, this could technically be considered a `KTable to KTable` join.

**Note:** `join` is an alias for `innerJoin`

### Usage

In our example, we are combining a `userInfoStream` containing users' personal information, with an `accountStream` which contains the meta information about the users' account, such as password, last login, etc.

```js
import { join, sink } from "@trivago/samsa";

const userInfoStream = getUserInfoStream();
const accountStream = getAccountStream();

const project = (user, account) => ({
    id: user.id,
    email: user.email,
    password: account.password, // encrypted, of course
    lastLogin: account.lastLogin
});

const userAccountStream = join(userInfoStream, accountStream, project);

userAccountStream.pipe(sink("my-volatile-storage"));
```

### How the join actually works.

A KTable is created for each of the streams, as well as a key map, containing the key and a timestamp of when the key was last seen.

If the `window` parameter is passed with a non-zero value, a clean up loop will be started in the background which will remove any keys from the key maps who's timestamp is less than `Date.now() - (window * 1000)`.

For each key value pair coming through the stream, a check is made against both key maps to determine if the key exists in both within the given time window. If it does, a value from each KTable is retrieved using the key, projected using the given projection, and then emitted. If no projection is given, the default is:

```javascript
const defaultProjection = (priary, foreign) => ({ primary, foreign });
```

<!-- TODO: -->
<!-- ## concat -->
