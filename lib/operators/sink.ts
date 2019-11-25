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

class Sink extends ObjectWritable {
    private batch: LevelUpChain;
    // TS doesn't understand when a variable
    // is set inside a function called inside the constructor :(
    // @ts-ignore
    private batchWriteTimeout: NodeJS.Timeout;
    private _count = 0;
    constructor(
        private store: LevelUp,
        private batchSize: number,
        private batchAge: number,
        private highWaterMark?: number
    ) {
        super({
            highWaterMark
        });

        this.batch = this.store.batch();
        this.startTimer();
    }

    private startTimer() {}

    private async finishBatch() {
        this.cork();

        await this.batch.write();
        this.batch = this.store.batch();

        this.uncork();
    }

    async _write(data: KeyValuePair, _: any, next: StreamErrorCallback) {
        // get the key and value
        const { key, value } = data;
        this._count++;
        // write the key and value to the batch, if need be
        if (value == null) {
            this.batch.del(key);
        } else {
            this.batch.put(key, value);
        }
        // if the batch length is greater than the max, clear the timer and write the batch
        if (this.batch.length === this.batchSize) {
            clearTimeout(this.batchWriteTimeout);
            await this.finishBatch();
        }
        // else if the batch length is 1, restart the timer
        else if (this.batch.length === 1) {
            this.startTimer();
        }
        next();
    }

    async _final(next: StreamErrorCallback) {
        await this.finishBatch();
        next();
    }

    public get(key: Key) {
        try {
            return this.store.get(key);
        } catch (err) {
            if (err.type === "NotFoundError") {
                return null;
            } else {
                throw err;
            }
        }
    }

    public get count() {
        return this._count;
    }

    public get batchInfo() {
        return this.batch;
    }
}

const NO_MAGIC_NUMBERS = 0;
let counter = NO_MAGIC_NUMBERS;

export const sink = (config: SinkConfig = {}) => {
    const {
        store = `.cache-${counter++}`,
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

    return new Sink(cache, highWaterMark, batchSize, batchAge);
};
