import { SinkConfig } from "./sink";
import { Transform } from "stream";
import levelup, { LevelUp } from "levelup";
import { AbstractLevelDOWN } from "abstract-leveldown";
import { Message } from "../_types";

export interface SinkConfig {
    maxBatchSize?: number;
    highWaterMark?: number;
    // batchAge?: number;
}
/**
 * Creates a sink connector for storing incoming data by key.
 * @param store A Abstract-LevelDOWN compliant data store
 * @param sinkConfig Configuration for the sink
 */
export const sink = (
    store: LevelUp | AbstractLevelDOWN,
    config: SinkConfig = {}
) => {
    const { maxBatchSize = 100000, highWaterMark = 500000 } = config;

    const cache = store instanceof AbstractLevelDOWN ? levelup(store) : store;

    let batch = cache.batch();
    let keys: (string | Buffer)[] = [];

    function writeKeys() {
        for (const key of keys) {
            output.push(key);
        }
        keys = [];
    }

    async function writeBatch() {
        try {
            await batch.write();
            batch = cache.batch();
            writeKeys();
        } catch (err) {
            batch = cache.batch();
            throw err;
        }
    }

    const output = new Transform({
        highWaterMark,
        objectMode: true,
        transform: async (data, _, next) => {
            const { key, value } = data;

            if (value === null) {
                batch.del(key);
                keys = keys.filter(k => k === key);
            } else {
                batch.put(key, value);
                keys.push(key);
            }

            if (batch.length === maxBatchSize) {
                try {
                    await writeBatch();
                } catch (err) {
                    console.error(err);
                }
            }

            next();
        }
    });

    return output;
};
