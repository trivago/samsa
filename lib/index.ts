import { Kafka } from "kafkajs";
import { Writable } from "stream";

import { tap, map, sink } from "./operators";
import { merge } from "./combinators";

import { createConsumerStream } from "./kafka/createConsumerStream";

import * as fs from "fs";
import { ObjectTransform } from "./utils/ObjectTransform";

const classSinkMemoryUsageView = fs.createWriteStream("low-batch-size.csv");

function memoryUsageLog(
    output: Writable,
    sampleRate: number = 1,
    sampleTime: number = 60,
    debug: boolean = false,
    callback = () => {}
) {
    output.write("time, rss, head\n");
    let rowCount = 0;

    setTimeout(() => {
        console.log("Sampling done");
        callback();
        process.exit(0);
    }, sampleTime * 1000);

    setInterval(() => {
        rowCount++;
        var mem = process.memoryUsage();
        var fmt = (v: number) => (v / (1024 * 1024)).toFixed(0) + "MB";
        output.write(`${rowCount},${mem.rss}, ${mem.heapUsed}\n`);
        if (debug) {
            console.log("RSS = " + fmt(mem.rss), "Heap = " + fmt(mem.heapUsed));
        }
    }, Math.floor(1000 / sampleRate));
}

(async () => {
    const client = new Kafka({
        brokers: [`${process.env.HOST_IP}:9092`],
        clientId: "my-client"
    });
    const primary = await createConsumerStream(client, {
        groupId: Date.now().toString(),
        topic: "requests",
        fromBeginning: true
    });
    const secondary = await createConsumerStream(client, {
        groupId: Date.now().toString(),
        topic: "responses",
        fromBeginning: true
    });

    let count = 0;
    memoryUsageLog(classSinkMemoryUsageView, 3, 120, false, () => {
        console.log(count);
    });

    const streamA = primary.pipe(sink());
    const streamB = secondary.pipe(sink());

    const blackhole = new Writable({
        objectMode: true,
        write(_, __, next) {
            console.log(_);
            count++;
            next();
        }
    });

    const primaryKeys = new Set();
    const foreignKeys = new Set();

    streamA.pipe(tap(key => primaryKeys.add(key)));
    streamB.pipe(tap(key => foreignKeys.add(key)));

    function morph(p: any, f: any) {
        return {
            primary: p,
            foriegn: f
        };
    }

    const merged = merge(streamA, streamB).pipe(
        new ObjectTransform({
            transform: async function(key, _, next) {
                console.log(key.toString());
                console.log("primary", primaryKeys.has(key));
                console.log("foreign", foreignKeys.has(key));
                if (primaryKeys.has(key) && foreignKeys.has(key)) {
                    const [p, f] = await Promise.all([
                        streamA.get(key),
                        streamB.get(key)
                    ]);
                    this.push({
                        key,
                        value: morph(p, f)
                    });
                }
                next();
            }
        })
    );

    merged.pipe(blackhole);

    // streamB.pipe(map(n => n.toString() + "\n")).pipe(blackhole);
})();
