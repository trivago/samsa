import { Transform } from "stream";
import { LevelUp } from "levelup";
import { Message } from "../_types";

interface SinkConfig {
    maxBatchSize?: number;
    highWaterMark?: number;
}

export const sink = (cache: LevelUp, sinkConfig: SinkConfig = {}) => {
    const { maxBatchSize = 10000, highWaterMark = 500000 } = sinkConfig;
    let _batch = cache.batch();
    let _keys: (string | Buffer)[] = [];
    let writeInterval: NodeJS.Timeout;

    const writeBatch = async () => {
        await _batch.write();
        _batch = cache.batch();
    };

    const setWriteInterval = () =>
        setInterval(async () => {
            await _batch.write();
            _batch = cache.batch();
        }, 1000);

    return new Transform({
        objectMode: true,
        highWaterMark,
        transform: async function transformSink(data: Message, _, next) {
            const { key, value } = data;
            if (!key) {
                throw new TypeError(`Expected a message containing a key`);
            }

            try {
                if (value !== null) {
                    _batch.put(key, value);
                    _keys.push(key);
                } else {
                    _batch.del(key);
                    _keys = _keys.filter(k => k !== key);
                }

                if (_batch.length >= maxBatchSize) {
                    await writeBatch();
                    while (_keys.length > 0) {
                        this.push(_keys.shift());
                    }
                    next();
                } else {
                    next();
                }
            } catch (err) {
                next(err);
            }
        },
        flush: async function flushSink(next) {
            /**
             * TODO: Add a toggle between key mode and array mode?
             */
            await writeBatch();
            while (_keys.length > 0) {
                this.push(_keys.shift());
            }
            // const keys = [..._keys];
            // _keys = [];
            // next(null, keys);
            next(null);
        }
    });
};
