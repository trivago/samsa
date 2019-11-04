import { createConsumerStream } from "./kafka/createConsumerStream";
import { Kafka } from "kafkajs";
import levelup from "levelup";
import leveldown from "leveldown";
import { sink } from "./operators/sink";

const cache = levelup(leveldown(".request-cache"));

const client = new Kafka({
    brokers: [`${process.env.HOST_IP}:9092`]
});

(async () => {
    const consumer = await createConsumerStream(client, {
        groupId: Date.now().toString(),
        topic: "requests",
        fromBeginning: true,
        autoResume: true,
        retryIn: 10
    });
    let count = 0;
    console.time("benchmark");
    consumer
        // .pipe(
        //     new Transform({
        //         objectMode: true,
        //         transform(data: KafkaMessage, _, next) {
        //             const { key, value } = data;
        //             // console.log(data);
        //             next(
        //                 null,
        //                 `${(key as Buffer).toString(
        //                     "utf8"
        //                 )}: ${(value as Buffer).toString("utf8")}\n`
        //             );
        //         }
        //     })
        // )
        .pipe(sink(cache, { maxBatchSize: 2e5 }))
        .on("data", (d: any) => {
            // console.log(d.length);
            // count += d.length;
            if (count++ >= 1e6) {
                console.timeEnd("benchmark");
                process.exit(0);
            }
        });
})();
