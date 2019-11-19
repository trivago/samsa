import { ObjectTransform } from "../utils/ObjectTransform";
import { TransformOptions, TransformCallback, Readable } from "stream";
import { Key } from "../operators/sink";
import { sink, tap } from "../operators";
import { merge } from "./merge";

// import leveldown from "leveldown";
// import levelup, { LevelUp } from "levelup";
// import { Readable, Transform } from "stream";
// import { merge } from "./merge";
// import * as fs from "fs";
// import * as path from "path";

// export interface JoinConfig extends SinkConfig {
//     cachePath?: string;
//     cacheNames?: {
//         primary: string;
//         foreign: string;
//     };
//     caches?: {
//         primary: LevelUp;
//         foreign: LevelUp;
//     };
// }

type JoinProjection = (a: any, b: any) => any;

// /**
//  * Joins two streams of key-value pairs into a single stream containing both pieces of information
//  * @param primary Readable stream containing primary information as key value pairs
//  * @param foreign Readable stream contianing forieng information as key value pairs
//  * @param joinConfig configuration for the caches used to join streams
//  * TODO: Choose a default type of store. Right now we're using LevelDB, but could this just be switched to an in memory store by default?
//  */
export const join = (
    primary: Readable,
    foreign: Readable,
    project: JoinProjection = (p, f) => [p, f],
    debug: boolean = false
) => {
    const primarySink = primary.pipe(sink());
    const foreignSink = foreign.pipe(sink());

    const primaryKeys: Set<Key> = new Set();
    const foreignKeys: Set<Key> = new Set();

    const output = new ObjectTransform({
        transform: async function joinTransform(key, _, next) {

            if (debug) {
                console.log("key:", key.toString());
                console.log("primary:", primaryKeys.has(key.toString()));
                console.log("foreign:", foreignKeys.has(key.toString()));
            }

            if (primaryKeys.has(key.toString()) && foreignKeys.has(key.toString())) {
                const [p, f] = await Promise.all([
                    primarySink.get(key),
                    foreignSink.get(key)
                ]);

                this.push({
                    key,
                    value: project(p, f)
                });
            }

            next();
        }
    });

    merge(
        primarySink.pipe(
            tap(key => {
                primaryKeys.add(key.toString());
            })
        ),
        foreignSink.pipe(
            tap(key => {
                foreignKeys.add(key.toString());
            })
        )
    ).pipe(output);

    return output;
};
// export const join = (
//     primary: Readable,
//     foreign: Readable,
//     transform: (valueA: any, valueB: any) => any,
//     joinConfig: JoinConfig = {}
// ) => {
//     const {
//         cachePath = ".cache",
//         cacheNames = {
//             primary: "primary",
//             foreign: "foreign"
//         },
//         caches: providedCaches,
//         ...sinkConfig
//     } = joinConfig;
//     let caches: {
//         primary: LevelUp;
//         foreign: LevelUp;
//     };

//     if (providedCaches) {
//         caches = providedCaches;
//     } else {
//         if (!fs.existsSync(path.join(cachePath))) {
//             fs.mkdirSync(path.join(cachePath));
//         }

//         const primaryPath = path.join(cachePath, cacheNames.primary);
//         const foreignPath = path.join(cachePath, cacheNames.foreign);

//         caches = {
//             primary: levelup(leveldown(primaryPath)),
//             foreign: levelup(leveldown(foreignPath))
//         };
//     }

//     const output = new Transform({
//         objectMode: true,
//         transform: (key, _, next) => {
//             Promise.all([caches.primary.get(key), caches.foreign.get(key)])
//                 .then(([pValue, fValue]) => {
//                     next(undefined, {
//                         key,
//                         [cacheNames.primary]: pValue,
//                         [cacheNames.foreign]: fValue
//                     });
//                 })
//                 .catch(err => {
//                     if (err.type === "NotFoundError") {
//                         return next();
//                     } else {
//                         return next(err);
//                     }
//                 });
//         }
//     });

//     // patricks solution :)
//     const streamA = primary.pipe(sink());
//     const streamB = foreign.pipe(sink());

//     const primaryKeys = new Set();
//     const secondaryKeys = new Set();

//     streamA.pipe(tap(key => primaryKeys.add(key)));
//     streamB.pipe(tap(key => secondaryKeys.add(key)));

//     merge(streamA, streamB).pipe(
//         new Transform({
//             objectMode: true,
//             transform: async function(key, _, next) {
//                 if (primaryKeys.has(key) && secondaryKeys.has(key)) {
//                     const [p, f] = await Promise.all([
//                         streamA.get(key),
//                         streamB.get(key)
//                     ]);
//                     this.push({
//                         key,
//                         value: transform(p, f)
//                     });
//                 }
//                 next();
//             }
//         })
//     );

//     merge(
//         primary.pipe(sink(caches.primary, sinkConfig)),
//         foreign.pipe(sink(caches.foreign, sinkConfig))
//     ).pipe(output);

//     return output;
// };
