import { ObjectWritable } from "../utils/ObjectWritable";
import { Key, StreamErrorCallback, KeyValuePair } from "../_types";

import levelup, { LevelUp, LevelUpChain } from "levelup";
import leveldown from "leveldown";
import { AbstractLevelDOWN } from "abstract-leveldown";

export type StoreConfig = LevelUp | AbstractLevelDOWN | string;

export interface SinkConfig {
    store?: StoreConfig;
    batchSize?: number;
    highWaterMark?: number;
    batchAge?: number;
}

class DataSink extends ObjectWritable {
    private batch: LevelUpChain;
    // TS doesn't understand when a variable
    // is set inside a function called inside the constructor :(
    // @ts-ignore
    private batchWriteTimeout: NodeJS.Timeout;
    constructor(
        private store: LevelUp,
        private batchSize: number,
        private batchAge: number,
        highWaterMark?: number
    ) {
        super({
            highWaterMark
        });

        this.batch = this.store.batch();
        this.startTimer();
    }

    private startTimer() {
        this.batchWriteTimeout = setTimeout(async () => {
            await this.finishBatch();
        }, this.batchAge);
    }

    private async finishBatch() {
        this.cork();

        try {
            await this.batch.write();
        } catch (err) {
            if (err.type !== "WriteError") {
                throw err;
            }
        }
        this.batch = this.store.batch();

        this.uncork();
    }

    async _write(data: KeyValuePair, _: any, next: StreamErrorCallback) {
        // get the key and value
        const { key, value } = data;
        // write the key and value to the batch, if need be
        if (value == null) {
            this.batch.del(key);
        } else {
            try {
                this.batch.put(key, value);
            } catch (err) {
                if (err.type === "WriteError") {
                    this.batch = this.store.batch();
                    this.batch.put(key, value);
                } else {
                    return next(err);
                }
            }
        }
        // if the batch length is greater than the max, clear the timer and write the batch
        if (this.batch.length === this.batchSize) {
            clearTimeout(this.batchWriteTimeout);
            try {
                await this.finishBatch();
            } catch (err) {
                return next(err);
            }
        }
        // else if the batch length is 1, restart the timer
        else if (this.batch.length === 1) {
            this.startTimer();
        }
        next();
    }

    async _final(next: StreamErrorCallback) {
        clearTimeout(this.batchWriteTimeout);
        try {
            await this.finishBatch();
        } catch (err) {
            return next(err);
        }
        next();
    }
}

const DEFAULT_CACHE_NAME_BASE = 0;
let counter = DEFAULT_CACHE_NAME_BASE;

/**
 * Creates a data sink stream, used as the final storage for a stream.
 *
 * Note: This is fundamentally different to my previous attempt at this.
 * Why?
 * The previous attempt had the keys coming back at userland code, which is okay for some
 * things, but in this case, it was a failure point, as the transform would close before
 * it was writing everything to the store.
 * @param config
 */
export const sink = (config: SinkConfig = {}) => {
    const {
        store = `.sink-${counter++}`,
        batchSize = 100000,
        highWaterMark = 500000,
        batchAge = 300
    } = config;

    let cache;

    if (typeof store === "string") {
        cache = levelup(leveldown(store));
    } else if (store instanceof AbstractLevelDOWN) {
        cache = levelup(store);
    } else {
        cache = store;
    }

    return new DataSink(cache, highWaterMark, batchSize, batchAge);
};
