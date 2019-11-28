// import { sink } from "./operators/sink";
// import { map } from "./operators/map";
// // import { Kafka } from "kafkajs";
// import { Writable } from "stream";
// import levelup from "levelup";
// import { LevelRedis } from "../level-redis/lib";
// // import { tap, map, sink } from "./operators";
// // import { merge } from "./combinators";

// import { join } from "./combinators/join";
// import { createConsumerStream } from "./kafka/createConsumerStream";
// import { Kafka } from "kafkajs";

// let debug = false;

// const blackHole = new Writable({
//     objectMode: true,
//     write(_, __, next) {
//         if (debug) {
//             console.log(_);
//         }
//         next();
//     }
// });
// import * as fs from "fs";

// // import { ObjectTransform } from "./utils/ObjectTransform";
// // import csv from "fast-csv";

// const classSinkMemoryUsageView = fs.createWriteStream("kafka-data-sink.csv");

// (async () => {
//     const client = new Kafka({
//         brokers: [`${process.env.HOST_IP}:9092`]
//     });
//     const requestStream = await createConsumerStream(client, {
//         groupId: Date.now().toString(),
//         topic: "requests",
//         fromBeginning: true
//     });
//     const responseStream = await createConsumerStream(client, {
//         groupId: Date.now().toString(),
//         topic: "responses",
//         fromBeginning: true
//     });

//     const dataSink = levelup(
//         new LevelRedis({
//             host: process.env.HOST_IP,
//             port: 6379
//         })
//     );

//     let count = 0;
//     memoryUsageLog(classSinkMemoryUsageView, 10, 300, false, () => {
//         console.log("finished");
//         console.log(count);
//     });

//     const joined = join(responseStream, requestStream, undefined, 60, {
//         batchSize: 100000
//     });
//     joined
//         // requestStream
//         .pipe(
//             map(() => {
//                 count++;
//                 return count;
//             })
//         )
//         .pipe(blackHole);
// })();

// function memoryUsageLog(
//     output: Writable,
//     sampleRate: number = 1,
//     sampleTime: number = 60,
//     debug: boolean = false,
//     callback = () => {}
// ) {
//     output.write("time, rss, head\n");
//     let rowCount = 0;

//     if (sampleTime > 0) {
//         setTimeout(() => {
//             console.log("Sampling done");
//             callback();
//             process.exit(0);
//         }, sampleTime * 1000);
//     }

//     setInterval(() => {
//         rowCount++;
//         var mem = process.memoryUsage();
//         var fmt = (v: number) => (v / (1024 * 1024)).toFixed(0) + "MB";
//         output.write(`${rowCount},${mem.rss}, ${mem.heapUsed}\n`);
//         if (debug) {
//             console.log("RSS = " + fmt(mem.rss), "Heap = " + fmt(mem.heapUsed));
//         }
//     }, Math.floor(1000 / sampleRate));
// }

// // const reader = fs.createReadStream("in.csv");
// // const parser = csv.parse({ delimiter: "," });

// // const logger = new Writable({
// //     objectMode: true,
// //     write(chunk, encoding, next) {
// //         console.log(chunk);
// //         next();
// //     }
// // });
// // const headers = ["item_id", "aa_star_rating"];

// // const transform = (row: any) => ({
// //     key: row.item_id,
// //     value: row.aa_star_rating
// // });

// // const arrayToObject = map(chunk =>
// //     headers.reduce((obj: any, fieldName, index) => {
// //         obj[fieldName] = chunk[index];
// //         return obj;
// //     }, {})
// // );

// // const cache = levelup(new LevelRedis({ host: process.env.HOST_IP }));
// // const s = sink({
// //     store: cache
// // });
// // const reading = reader
// //     .pipe(parser)
// //     .pipe(arrayToObject)
// //     .pipe(map(transform))
// //     .pipe(s);

// // console.time("benchmark");
// // reading.on("finish", () => {
// //     console.timeEnd("benchmark");
// //     // process.exit();
// // });

// // let count = 0;
// // const final = reader
// //     .pipe(parser)
// //     .pipe(arrayToObject)
// //     .pipe(map(transform))
// //     .pipe(sink({ store: cache }))
// //     .pipe(
// //         new Writable({
// //             objectMode: true,
// //             write(d, _, n) {
// //                 count++;
// //                 console.log(d);
// //                 n();
// //             }
// //         })
// //     );

// // final.on("finish", () => {
// //     console.log("finished");
// //     console.log(count);
// // });

// // reader
// //     .pipe(parser)
// //     .pipe(arrayToObject)
// //     .pipe(map(transform))
// //     .pipe(
// //         sink({
// //             store: cache
// //         })
// //     );

// // (async () => {
// //     const client = new Kafka({
// //         brokers: [`${process.env.HOST_IP}:9092`],
// //         clientId: "my-client"
// //     });
// //     const primary = await createConsumerStream(client, {
// //         groupId: Date.now().toString(),
// //         topic: "requests",
// //         fromBeginning: true
// //     });
// //     const secondary = await createConsumerStream(client, {
// //         groupId: Date.now().toString(),
// //         topic: "responses",
// //         fromBeginning: true
// //     });

// //     let count = 0;
// // memoryUsageLog(classSinkMemoryUsageView, 1, 0, false);

// //     const streamA = primary.pipe(sink());
// //     const streamB = secondary.pipe(sink());

// //     const blackhole = new Writable({
// //         objectMode: true,
// //         write(_, __, next) {
// //             console.log(_);
// //             count++;
// //             next();
// //         }
// //     });

// //     const primaryKeys = new Set();
// //     const foreignKeys = new Set();

// //     streamA.pipe(tap(key => primaryKeys.add(key)));
// //     streamB.pipe(tap(key => foreignKeys.add(key)));

// //     function morph(p: any, f: any) {
// //         return {
// //             primary: p,
// //             foriegn: f
// //         };
// //     }

// //     const merged = merge(streamA, streamB).pipe(
// //         new ObjectTransform({
// //             transform: async function(key, _, next) {
// //                 console.log(key.toString());
// //                 console.log("primary", primaryKeys.has(key));
// //                 console.log("foreign", foreignKeys.has(key));
// //                 if (primaryKeys.has(key) && foreignKeys.has(key)) {
// //                     const [p, f] = await Promise.all([
// //                         streamA.get(key),
// //                         streamB.get(key)
// //                     ]);
// //                     this.push({
// //                         key,
// //                         value: morph(p, f)
// //                     });
// //                 }
// //                 next();
// //             }
// //         })
// //     );

// //     merged.pipe(blackhole);

// //     // streamB.pipe(map(n => n.toString() + "\n")).pipe(blackhole);
// // })();
