import { SinkConfig } from "./sink";
import { TransformCallback } from "stream";
import levelup, { LevelUp, LevelUpChain } from "levelup";
import leveldown from "leveldown";
import { AbstractLevelDOWN } from "abstract-leveldown";
import { ObjectTransform } from "../utils/ObjectTransform";

export type StoreConfig = LevelUp | AbstractLevelDOWN | string;

export type Key = string | Buffer;
export interface SinkConfig {
    store?: StoreConfig;
    batchSize?: number;
    highWaterMark?: number;
    batchAge?: number;
}
/**
 * Creates a sink connector for storing incoming data by key.
 * @param store A Abstract-LevelDOWN compliant data store
 * @param sinkConfig Configuration for the sink
 */

// sink could potentially return a key-based look up in line with what KTable
// KTable completely encapsulates its internal storage
// manages RocksDB internally

class Sink extends ObjectTransform {
    private batch: LevelUpChain;
    private keys: Key[] = [];
    private batchWriteTimeout!: NodeJS.Timeout;
    private writing: boolean = false;

    constructor(
        private cache: LevelUp,
        highWaterMark: number,
        private batchSize: number,
        private batchAge: number
    ) {
        super({
            highWaterMark
        });

        this.batch = this.cache.batch();
        this.startTimer();
    }

    private startTimer() {
        clearTimeout(this.batchWriteTimeout);
        this.batchWriteTimeout = setTimeout(async () => {
            this.pause();
            await this.writeBatch();
            this.writeKeys();
            this.resume();
        }, this.batchAge);
    }

    private async writeBatch() {
        if (this.batch.length > 0 && !this.writing) {
            this.writing = true;
            await this.batch.write();
            this.batch = this.cache.batch();
            this.writing = false;
        }
    }

    private writeKeys() {
        for (const key of this.keys) {
            this.push(key);
        }
        this.keys = [];
        this.startTimer();
    }

    private writeToBatch(key: Key, value: any) {
        if (value === null) {
            this.batch.del(key);
            this.keys = this.keys.filter(k => k === key);
        } else {
            this.batch.put(key, value);
            this.keys.push(key);
        }
    }

    public get(key: Key) {
        try {
            return this.cache.get(key);
        } catch (err) {
            if (err.type === "NotFoundError") {
                return;
            } else {
                throw err;
            }
        }
    }

    async _transform(data: any, _: any, next: TransformCallback) {
        const { key, value } = data;
        try {
            this.writeToBatch(key, value);
        } catch (err) {
            if (err.type === "WriteError") {
                this.batch = this.cache.batch();
                this.writeToBatch(key, value);
            } else {
                next(err);
                return;
            }
        }

        if (this.batch.length === this.batchSize) {
            clearTimeout(this.batchWriteTimeout);
            this.writeBatch();
            this.writeKeys();
        } else if (this.batch.length === 1) {
            clearTimeout(this.batchWriteTimeout);
            this.startTimer();
        }

        next();
    }
    async _flush(next: TransformCallback) {
        await this.writeBatch();
        this.writeKeys();

        next();
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
