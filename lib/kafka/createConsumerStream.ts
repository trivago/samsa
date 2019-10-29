import { TopicConfig } from "./../_types";
import { Message } from "../_types";
import { curry } from "lodash/fp";
import {
    Kafka,
    ConsumerConfig,
    Consumer,
    EachMessagePayload,
    KafkaMessage
} from "kafkajs";
import { Readable } from "stream";

// class ConsumerStream extends Readable {
//     // private consumer: Consumer;
//     // private data: Message[] = [];
//     // private connected: boolean = false;

//     // constructor(
//     //     private client: Kafka,
//     //     private consumerConfig: ConsumerConfig,
//     //     private topicConfig: TopicConfig
//     // ) {
//     //     super({
//     //         objectMode: true
//     //     });
//     //     this.consumer = client.consumer(consumerConfig);
//     // }

//     // async connect() {
//     //     const { topic, fromBeginning } = this.topicConfig;
//     //     await this.consumer.connect();
//     //     await this.consumer.subscribe({
//     //         topic,
//     //         fromBeginning
//     //     });

//     //     this.connected = true;
//     //     return this;
//     // }

//     async _read() {
//         // if (this.connected) {
//         //     await this.consumer.run({
//         //         eachBatch: async data => {
//         //             const { batch } = data;
//         //             this.data = [...batch.messages];

//         //             await this.consumer.stop();

//         //             while (this.data.length > 0) {
//         //                 this.push(this.data.shift());
//         //             }
//         //         }
//         //     });
//         // }
//         // const { topic, fromBeginning } = this.topicConfig;
//         // while()
//         // this.consumer.resume([{ topic }]);
//     }
// }

/**
 * Creates a stream containing the messages
 * @param client
 * @param ConsumerConfig
 * @param topicConfig
 */
export const createConsumerStream = async (
    client: Kafka,
    consumerConfig: ConsumerConfig,
    topicConfig: TopicConfig
) => {
    const { topic, fromBeginning = true } = topicConfig;
    let source: KafkaMessage[] = [];

    const consumer = client.consumer(consumerConfig);

    await consumer.connect();
    await consumer.subscribe({
        topic,
        fromBeginning
    });

    const stream = new Readable({
        objectMode: true,
        read: function() {
            while (source.length > 0) {
                const next = source.shift();
                this.push(next);
            }
            consumer.resume([{ topic }]);
        }
    });

    await consumer.run({
        eachBatch: data => {
            source = source.concat(data.batch.messages);

            consumer.pause([{ topic }]);
            return Promise.resolve();
        }
    });

    return stream;
};

// {
//         // const {
//         //     topic,
//         //     resumeAfter = 1000,
//         //     fromBeginning = true,
//         //     autoCommit = true
//         // } = topicConfig;

//         // const consumer = client.consumer(consumerConfig);

//         // let data = [];

//         // const stream = new Readable({
//         //     objectMode: true,
//         //     read() {
//         //         // await consumer.run();
//         //     }
//         // });

//         // connect to our consumer
//         // consumer
//         //     .connect()
//         //     //     // subscribe to a specific topic
//         //     .then(() =>
//         //         consumer.subscribe({
//         //             topic,
//         //             fromBeginning
//         //         })
//         //     )
//         //     .then(() => {
//         //         consumer.run({
//         //             eachBatchAutoResolve: autoCommit,
//         //             eachBatch: async data => {
//         //                 const { batch, resolveOffset } = data;
//         //                 const { messages } = batch;
//         //                 for (const { key, value, offset } of messages) {
//         //                     const next: Message = {
//         //                         key,
//         //                         value
//         //                     };
//         //                     if (!autoCommit) {
//         //                         next.commit = () => resolveOffset(offset);
//         //                     }
//         //                     stream.push(next);
//         //                 }
//         //             }
//         //         });
//         //     });

//         // stream.on("pause", e => {
//         //     consumer.pause([
//         //         {
//         //             topic: topic as string
//         //         }
//         //     ]);
//         //     setTimeout(() => {
//         //         consumer.resume([
//         //             {
//         //                 topic: topic as string
//         //             }
//         //         ]);
//         //     }, resumeAfter);
//         // });

//         return stream;
//     }
// );
// ()
