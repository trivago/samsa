import { Readable, TransformCallback } from "stream";
import { JoinProjection, KTableConfig, Key } from "../_types";
import { ObjectTransform } from "../utils/ObjectTransform";
import { fork, ChildProcess } from "child_process";
import { EventEmitter } from "events";
import { KTable } from "../kafka/KTable";
import { merge } from "./merge";
import { resolve } from "path";

const defaultProjection: JoinProjection<
    any,
    any,
    { primary: any; foreign: any }
> = (primary, foreign) => ({
    primary,
    foreign
});

class Joiner extends ObjectTransform {
    private keyBuffer: Set<Key> = new Set();
    private subProcesses: Set<ChildProcess> = new Set();
    private keyBufferProcessInterval: NodeJS.Timeout;

    constructor(
        public primaryKTable: KTable,
        public foreignKTable: KTable,
        private projection: JoinProjection<any, any, any>,
        private maxKeyBufferSize: number = 10000,
        private keyBufferInterval: number = 1000
    ) {
        super();

        this.keyBufferProcessInterval = this.startProcessInterval();
    }

    private startProcessInterval() {
        this.keyBufferProcessInterval = setInterval(() => {
            this.finalizeBuffer();
        }, this.keyBufferInterval);
        return this.keyBufferProcessInterval;
    }

    public finishUp() {
        return new Promise(res => {
            clearInterval(this.keyBufferProcessInterval);

            if (this.keyBuffer.size > 0) {
                const ee = this.finalizeBuffer();

                ee.on("finish", () => {
                    this.end();
                    res();
                });
            } else {
                this.end();
                res();
            }
        });
    }

    public finalizeBuffer() {
        const notifier = new EventEmitter();

        const keyBuffer = [...this.keyBuffer];
        this.keyBuffer = new Set();
        const subProcess = fork(
            // odd hack to get this working with jest
            // jest doesn't even attempt to transpile submodules
            resolve(__dirname, `keyCheck.${__filename.slice(-2)}`),
            [this.primaryKTable.storeName, this.foreignKTable.storeName]
        );

        this.subProcesses.add(subProcess);

        subProcess.send(keyBuffer);

        subProcess.on("exit", () => {
            this.subProcesses.delete(subProcess);
            notifier.emit("finish");
        });

        subProcess.on("error", err => {
            this.destroy(err);
        });

        subProcess.on("message", ({ key, primary, foreign }) => {
            const value = this.projection(
                Buffer.from(primary),
                Buffer.from(foreign)
            );

            this.push({
                key,
                value
            });
        });

        return notifier;
    }

    async _transform(key: Key, _: any, next: TransformCallback) {
        this.keyBuffer.add(key);

        if (this.keyBuffer.size >= this.maxKeyBufferSize) {
            clearInterval(this.keyBufferProcessInterval);
            this.finalizeBuffer();
            this.startProcessInterval();
        }

        next();
    }

    _final(next: TransformCallback) {
        this.finishUp();
        next();
    }
}

export const innerJoin = <P extends any, F extends any, R extends any>(
    primaryStream: Readable,
    foreignStream: Readable,
    project: JoinProjection<P, F, any> = defaultProjection,
    kTableConfig: KTableConfig = {},
    maxKeyBufferSize: number = 10000,
    keyBufferInterval: number = 1000,
    /**
     * Window currently won't do anything, until we can get a PR to RocksDB.
     * Leaving this so that it can be added later
     */
    window: number = 0
) => {
    const { batchAge, batchSize } = kTableConfig;

    const primaryTable = new KTable(batchSize, batchAge);
    const foreignTable = new KTable(batchSize, batchAge);

    const joiner = new Joiner(
        primaryTable,
        foreignTable,
        project,
        maxKeyBufferSize,
        keyBufferInterval
    );

    const primaryKeyStream = primaryStream.pipe(primaryTable);
    const foreignKeyStream = foreignStream.pipe(foreignTable);

    const mergedInput = merge(primaryKeyStream, foreignKeyStream);

    mergedInput.pipe(
        joiner,
        { end: false }
    );

    // handle mergedInput ending
    mergedInput.on("end", async () => {
        await joiner.finishUp();
    });

    return joiner;
};

export const join = innerJoin;
