// import { ObjectTransform } from "../utils/ObjectTransform";
// import { fork, ChildProcess } from "child_process";
// import { TransformCallback, Readable } from "stream";
// import { Key, KTableConfig, JoinProjection, KeyMap } from "../_types";
// import { KTable } from "../kafka/KTable";
// import { tap } from "../operators";
// import { merge } from "./merge";
// import * as path from "path";
// import { EventEmitter } from "events";

// const defaultProjection: JoinProjection<
//     any,
//     any,
//     { primary: any; foreign: any }
// > = (primary, foreign) => ({ primary, foreign });

// // const storeKey = (store: KeyMap) =>
// //     tap((key: Key) => {
// //         store.set(key.toString(), Date.now());
// //     });

// // const startCleanupLoop = (timeWindow: number, ...maps: KeyMap[]) => {
// //     const now = Date.now();
// //     return setInterval(() => {
// //         for (const keyMap of maps) {
// //             for (const [key, timestamp] of keyMap) {
// //                 const timeDiff = Math.abs(now - timestamp);

// //                 if (timeDiff > timeWindow) {
// //                     keyMap.delete(key);
// //                 }
// //             }
// //         }
// //     }, timeWindow);
// // };

// /**
//  * Represents and windowed inner join in a streaming context.
//  *
//  * @param primaryStream The primary stream to read from
//  * @param foreignStream The foreign stream to read from
//  * @param project a projection to be used when values from each stream are found
//  * @param window how long to keep keys in memory
//  * @param kTableConfig optional configuration for the underlying ktables that are used for joins
//  */
// export const innerJoin = <P extends any, F extends any, R extends any>(
//     primaryStream: Readable,
//     foreignStream: Readable,
//     project: JoinProjection<P, F, any> = defaultProjection,
//     window: number = 0,
//     kTableConfig: KTableConfig = {}
// ) => {
//     const { batchAge, batchSize } = kTableConfig;
//     // const primaryKeyMap: KeyMap = new Map();
//     // const foreignKeyMap: KeyMap = new Map();

//     let processes: ChildProcess[] = [];

//     const primaryTable = new KTable(batchSize, batchAge);
//     const foreignTable = new KTable(batchSize, batchAge);

//     let buffer: Set<Key> = new Set();

//     // const seenBoth = (key: Key) =>
//     //     primaryKeyMap.has(key.toString()) && foreignKeyMap.has(key.toString());

//     // let cleanupLoop: NodeJS.Timeout;

//     // if (window > 0) {
//     //     cleanupLoop = startCleanupLoop(
//     //         window * 1000,
//     //         primaryKeyMap,
//     //         foreignKeyMap
//     //     );
//     // }

//     const int = setInterval(finalizeBuffer, 1000);

//     const joinedOutput = new ObjectTransform({
//         transform: async function innerJoinTransform(
//             key: Key,
//             _: any,
//             next: TransformCallback
//         ) {
//             buffer.add(key);
//             next();
//         }
//         // final(next) {
//         //     console.log("final called");
//         //     clearInterval(int);
//         //     if (buffer.length > 0) {
//         //         finalizeBuffer();
//         //     }
//         //     next();
//         // },
//         // flush(next) {
//         //     console.log("flush called");
//         //     clearInterval(int);
//         //     if (buffer.length > 0) {
//         //         finalizeBuffer();
//         //     }
//         //     next();
//         // }
//     });

//     function finalizeBuffer() {
//         const bufferBus = new EventEmitter();
//         const buff = [...buffer];
//         buffer = new Set();

//         const child = fork(path.join(__dirname, "keyCheck.js"), [
//             primaryTable.storeName,
//             foreignTable.storeName
//         ]);

//         child.send(buff);

//         child.on("exit", () => {
//             processes = processes.filter(p => p !== child);
//             bufferBus.emit("finish");
//         });

//         child.on("error", err => {
//             joinedOutput.destroy(err);
//         });

//         child.on("message", ({ key, primary, foreign }) => {
//             joinedOutput.push({
//                 key,
//                 // @ts-ignore
//                 value: project(Buffer.from(primary), Buffer.from(foreign))
//             });
//         });

//         return bufferBus;
//     }

//     const primaryKeyStream = primaryStream.pipe(primaryTable);
//     const foreignKeyStream = foreignStream.pipe(foreignTable);

//     const mergedInput = merge(primaryKeyStream, foreignKeyStream);

//     mergedInput.pipe(
//         joinedOutput,
//         { end: false }
//     );

//     mergedInput.on("end", () => {
//         clearInterval(int);

//         if (buffer.size > 0) {
//             const bufferBus = finalizeBuffer();

//             bufferBus.on("finish", () => {
//                 joinedOutput.end();
//             });
//         }
//     });

//     return joinedOutput;
// };
// /**
//  * Alias to innerJoin
//  */
// export const join = innerJoin;

import { Readable, TransformCallback } from "stream";
import { JoinProjection, KTableConfig, Key } from "../_types";
import { ObjectTransform } from "../utils/ObjectTransform";
import { fork, ChildProcess } from "child_process";
import { EventEmitter } from "events";
import { KTable } from "../kafka/KTable";
import { merge } from "./merge";

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
        private projection: JoinProjection<any, any, any>
    ) {
        super();

        this.keyBufferProcessInterval = setInterval(() => {
            this.finalizeBuffer();
        }, 1000);
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
            "keyCheck",
            [this.primaryKTable.storeName, this.foreignKTable.storeName],
            {
                cwd: __dirname
            }
        );

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
    /**
     * Window currently won't do anything, until we can get a PR to RocksDB.
     * Leaving this so that it can be added later
     */
    window: number = 0
) => {
    const { batchAge, batchSize } = kTableConfig;

    const primaryTable = new KTable(batchSize, batchAge);
    const foreignTable = new KTable(batchSize, batchAge);

    const joiner = new Joiner(primaryTable, foreignTable, project);

    const primaryKeyStream = primaryStream.pipe(primaryTable);
    const foreignKeyStream = foreignStream.pipe(foreignTable);

    const mergedInput = merge(primaryKeyStream, foreignKeyStream);

    mergedInput.pipe(
        joiner,
        { end: false }
    );

    // handle mergedInput ending
    mergedInput.on("end", () => {
        joiner.finishUp();
    });

    return joiner;
};

export const join = innerJoin;
