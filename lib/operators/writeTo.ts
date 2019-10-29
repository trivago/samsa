import { Transform } from "stream";
import { LevelUp } from "levelup";
import { Message } from "../_types";

export interface CacheConfig {
    batchSize?: number;
    highWaterMark?: number;
}

export const defaultWriteToBatchSize = 100000;
export const defaultWriteToHighWaterMark = 500000;

export const writeTo = (cache: LevelUp, cacheConfig: CacheConfig = {}) => {
    const { batchSize = defaultWriteToBatchSize } = cacheConfig;

    let _batch = cache.batch();
    let _keys: (string | Buffer)[] = [];
    let _commits: (() => void)[] = [];

    const writeBuffer = async () => {
        await _batch.write();
        _batch = cache.batch();

        const commits = [..._commits];
        _commits = [];
        for (const commit of _commits) {
            commit();
        }
    };

    return new Transform({
        objectMode: true,
        highWaterMark: 500000,
        transform: async function transformWriteTo(data: Message, _, next) {
            const { key, value, commit } = data;

            if (!key || !value) {
                throw new TypeError(
                    `Expected a message containing a key and a value`
                );
            }

            try {
                _batch.put(key, value);
                _keys.push(key);
                if (commit) {
                    _commits.push(commit);
                }
                if (_batch.length >= batchSize) {
                    await writeBuffer();
                    const keys = [..._keys];
                    _keys = [];
                    next(null, keys);
                } else {
                    next();
                }
            } catch (err) {
                next(err);
            }
        },
        flush: async function flushWriteTo(next) {
            await writeBuffer();
            this.push(_keys);
            next();
        }
    });
};

// /**
//  * Caches a message into the supplied LevelUp cache
//  * @param cache
//  * @param cacheConfig
//  */
// export const writeTo = (cache: LevelUp, cacheConfig: CacheConfig) => {
//     const { highWaterMark = defaultWriteToHighWaterMark } = cacheConfig;
//     let _buffer = cache.batch();
//     let _commits: (() => void)[] = [];
//     let _keys: (string | Buffer)[] = [];

//     // Handle the writing of our buffer and resets our commits
//     const writeBuffer = async () => {
//         await _buffer.write();
//         _buffer = cache.batch();

//         if (_commits.length > 0) {
//             _commits.forEach(c => c());
//             // await Promise.all(_commits.map(c => c()));
//             // _commits = [];
//         }
//     };

//     return new Transform({
//         objectMode: true,
//         highWaterMark: highWaterMark,
//         transform: async function(data: Message, _, next) {
//             const { key, value, finished } = data;

//             if (!key || !value) {
//                 throw new TypeError(
//                     `Expected a message containing a key and a value`
//                 );
//             }

//             try {
//                 _buffer.put(key, value);
//                 _keys.push(key);
//                 if (finished) {
//                     _commits.push(finished);
//                 }

//                 if (_buffer.length >= highWaterMark) {
//                     await writeBuffer();

//                     // once we've written our buffer, we need to pass the cached keys to
//                     // the next transform
//                     for (const key of _keys) {
//                         this.push(key);
//                     }

//                     _keys = [];
//                 }

//                 next();
//             } catch (err) {
//                 next(err);
//             }
//         },
//         flush: async function(next) {
//             await writeBuffer();
//             for (const key of _keys) {
//                 this.push(key);
//             }
//             next();
//         }
//     });
// };
