import { writeTo } from "./operators/writeTo";
import { createConsumerStream } from "./kafka/createConsumerStream";
import { Kafka } from "kafkajs";
import levelup from "levelup";
import leveldown from "leveldown";

const cache = levelup(leveldown(".request-cache"));

const client = new Kafka({
    brokers: [`${process.env.HOST_IP}:9092`]
});

(async () => {
    const consumer = await createConsumerStream(
        client,
        {
            groupId: Date.now().toString()
        },
        {
            topic: "requests",
            fromBeginning: true
            // resumeAfter: 10,
            // autoCommit: true
        }
    );

    consumer.on("data", console.log);
})();

// consumer.connect().pipe(writeTo(cache)).on("data", d => {
//     // console.log(d);
//     // console.log("finished writing", d.length, "messages");
// });

// (async () => {
//     const runningConsumer = await consumer.connect();

//     runningConsumer.pipe(process.stdout);
// })();
