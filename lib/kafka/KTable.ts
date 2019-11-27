import { TransformCallback } from "stream";
import leveldown from "leveldown";
import { LevelUp, LevelUpChain, default as levelup } from "levelup";

import { Key, KeyValuePair, StreamErrorCallback } from "../_types";
import { ObjectTransform } from "../utils/ObjectTransform";

const DEFAULT_CACHE_NAME_BASE = 0;
let counter = DEFAULT_CACHE_NAME_BASE;

export class KTable extends ObjectTransform {
    private store: LevelUp;
    private batch: LevelUpChain;
    private batchWriteTimeout!: NodeJS.Timeout;
    private keys: Key[];
    // private writing: boolean = false;
    constructor(
        private batchSize: number = 10000,
        private batchAge: number = 300,
        highWaterMark: number = 500000
    ) {
        super({
            highWaterMark
        });
        this.store = levelup(leveldown(`.cache-${counter++}`));
        this.batch = this.store.batch();
        this.keys = [];
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
        this.pushKeys();

        this.uncork();
    }

    private pushKeys() {
        for (const key of this.keys) {
            this.push(key);
        }
        this.keys = [];
    }

    async _transform(data: KeyValuePair, _: any, next: TransformCallback) {
        const { key, value } = data;
        if (value == null) {
            this.batch.del(key);
            this.keys = this.keys.filter(
                _key => _key.toString() === key.toString()
            );
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
            this.keys.push(key);
        }
        if (this.batch.length > this.batchSize) {
            clearTimeout(this.batchWriteTimeout);
            await this.finishBatch();
        } else if (this.batch.length === 1) {
            this.startTimer();
        }
        next();
    }
    async _final(next: StreamErrorCallback) {
        if (this.batch.length > 0) {
            clearTimeout(this.batchWriteTimeout);
            await this.finishBatch();
            this.pushKeys();
        }
        next();
    }
    async _flush(next: StreamErrorCallback) {
        if (this.batch.length > 0) {
            clearTimeout(this.batchWriteTimeout);
            await this.finishBatch();
            this.pushKeys();
        }
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
}
