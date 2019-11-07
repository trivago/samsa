import { Transform } from "stream";
import levelup, { LevelUp } from "levelup";
import { AbstractLevelDOWN } from "abstract-leveldown";
import { Message } from "../_types";

export interface SinkConfig {
    maxBatchSize?: number;
    highWaterMark?: number;
    batchAge?: number;
}
/**
 * Creates a sink connector for storing incoming data by key.
 * @param store A Abstract-LevelDOWN compliant data store
 * @param sinkConfig Configuration for the sink
 */
export const sink = (
    store: LevelUp | AbstractLevelDOWN,
    sinkConfig: SinkConfig = {}
) => {
    const {
        maxBatchSize = 10000,
        highWaterMark = 500000,
        batchAge = 1000
    } = sinkConfig;
    store = store instanceof AbstractLevelDOWN ? levelup(store) : store;

    let _batch = store.batch();
    let _keys: (string | Buffer)[] = [];
    let writeInterval: NodeJS.Timeout;

    const setWriteInterval = () =>
        setInterval(async () => {
            // because the abstract level down types suck
            // @ts-ignore
            await _batch.write();
            _batch = store.batch();
        }, batchAge);

    const writeBatch = async () => {
        clearInterval(writeInterval);
        // because the abstract level down types suck
        // @ts-ignore
        await _batch.write();
        _batch = store.batch();
        writeInterval = setWriteInterval();
    };

    return new Transform({
        objectMode: true,
        highWaterMark,
        transform: async function transformSink(data: Message, _, next) {
            const { key, value } = data;
            if (key === undefined || key === null) {
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
            await writeBatch();
            while (_keys.length > 0) {
                this.push(_keys.shift());
            }
            next(null);
        }
    });
};
