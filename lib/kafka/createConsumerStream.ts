import { StreamConfig, Message } from "./../_types";
import { Kafka, KafkaConfig } from "kafkajs";
import { Readable } from "stream";

/**
 * Creates a stream containing messages from the requested Kafka topic
 * @param client
 * @param streamConfig
 */

export const createConsumerStream = async (
    kafkaClientOrConfig: Kafka | KafkaConfig,
    streamConfig: StreamConfig
) => {
    const {
        topic,
        fromBeginning = true,
        highWaterMark = 20000,
        autoResume = true,
        retryIn = 1000, // allow for more fine grained control
        ...consumerConfig
    } = streamConfig;

    // our caching mechanism of sorts
    let _messages: Message[] = [];

    // to keep track of if our consumer is currently connected and running
    let connected = false;
    let running = false;

    const client =
        kafkaClientOrConfig instanceof Kafka
            ? kafkaClientOrConfig
            : new Kafka(kafkaClientOrConfig);

    // create our consumer
    const consumer = client.consumer(consumerConfig);

    // connect our consumer and subscribe
    await consumer.connect().then(() => (connected = true));
    await consumer.subscribe({
        topic,
        fromBeginning
    });

    const startConsumer = () =>
        consumer.run({
            eachBatchAutoResolve: false,
            eachBatch: ({ batch: { messages }, resolveOffset }) => {
                running = true;

                // add any new messages to the messages queue
                _messages = _messages.concat(
                    messages.map(({ key, value, offset }) => ({
                        key,
                        value,
                        commit: () => resolveOffset(offset)
                    }))
                );

                // if we have more messages than our highWaterMark, we need to pause the consumer
                if (_messages.length > highWaterMark) {
                    consumer.pause([{ topic }]);
                    running = false;
                }

                // I blame Blizzard:
                // https://github.com/Blizzard/node-rdkafka/blob/master/lib/kafka-consumer-stream.js#L231
                stream._read(0);

                // bit of a microoptimization, because of how the async keyword is handled when compiling to JS
                return Promise.resolve(undefined);
            }
        });

    // This is our stream.
    const stream = new Readable({
        objectMode: true,
        highWaterMark: 500000,
        read: async function(_size: number) {
            // On each read, we check if there are messages in the queue.
            // If there are, and that message exists, we push the message down the pipeline
            /**
             * TODO:
             * Figure out what we should provide down the pipe. Does it make sense to send the whole message,
             * or just the key and value? One thing we could do is pass down the resolveOffset function as well
             * so that we can say when we pushed that message?
             */
            if (_messages.length > 0) {
                const next = _messages.shift();
                if (next) {
                    const { key, value, commit } = next;
                    this.push({ key, value });
                    if (commit) {
                        commit();
                    }
                }
                return;
            }

            // if we have paused topics, restart them
            if (consumer.paused().length > 0) {
                return consumer.resume([{ topic }]);
            }

            if (!connected || this.destroyed || this.isPaused() || running) {
                return;
            }

            // if we aren't already running, start up the consumer
            if (!running) {
                return startConsumer();
            }
        }
    });

    // If our stream pauses because of backpressure somewhere down the line
    // we immediately pause the consumer and give downstream some time to catch up
    // this is configurable through the retryIn field
    stream.on("pause", () => {
        consumer.pause([
            {
                topic
            }
        ]);
        running = false;
        if (autoResume) {
            setTimeout(() => {
                stream.resume();
            }, retryIn);
        }
    });

    // once we know the stream needs to restart, we'll start reading again.
    stream.on("resume", () => {
        stream._read(0);
    });

    return stream;
};
