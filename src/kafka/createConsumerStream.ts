import { StreamConfig, Message } from "../_types";
import { Kafka, KafkaConfig, Consumer } from "kafkajs";
import { Readable } from "stream";

const defaultConsumerConfig = {
    highWaterMark: 100000,
    autoResume: true,
    resumeAfter: 100
};
class ConsumerStream extends Readable {
    private buffer: Message[] = [];
    private running: boolean = false;

    constructor(
        private consumer: Consumer,
        private topic: string,
        private config: {
            highWaterMark: number;
            autoResume: boolean;
            resumeAfter: number;
        } = defaultConsumerConfig
    ) {
        super({ objectMode: true });

        this.running = false;

        this.on("pause", () => {
            this.pauseTopics();

            if (this.config.autoResume) {
                setTimeout(() => {
                    this.resume();
                }, this.config.resumeAfter);
            }
        });

        this.on("resume", () => {
            this.resumeTopics();
        });
    }

    pauseTopics() {
        this.consumer.pause([
            {
                topic: this.topic
            }
        ]);
    }

    resumeTopics() {
        this.consumer.resume([
            {
                topic: this.topic
            }
        ]);
    }

    run() {
        this.running = true;
        this.consumer.run({
            eachBatchAutoResolve: false,
            eachBatch: ({ batch: { messages }, resolveOffset }) => {
                this.running = true;

                this.buffer = this.buffer.concat(
                    messages.map(({ key, value, offset }) => ({
                        key,
                        value,
                        commit: () => resolveOffset(offset)
                    }))
                );

                if (this.buffer.length > 100000) {
                    this.pauseTopics();
                }
                this._read();

                return Promise.resolve(undefined);
            }
        });
    }

    _read() {
        // if the buffer has messages, send them before consuming more
        // this is, believe it or not, faster than shifting messages and sending them
        // one at a time
        if (this.buffer.length > 0) {
            for (const message of this.buffer) {
                const { key, value, commit } = message;
                this.push({
                    key,
                    value
                });
                if (commit && typeof commit === "function") {
                    commit();
                }
            }
            this.buffer = [];

            return;
        }

        if (this.destroyed || this.isPaused()) {
            return;
        }

        if (!this.running) {
            return this.run();
        }

        if (this.consumer.paused().length > 0) {
            return this.resumeTopics();
        }
    }
}

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
        highWaterMark = 100000,
        autoResume = true,
        resumeAfter = 1000, // allow for more fine grained control
        ...consumerConfig
    } = streamConfig;

    const client = kafkaClientOrConfig?.constructor?.name === 'Client'
        ? kafkaClientOrConfig
        : new Kafka(kafkaClientOrConfig as KafkaConfig);

    // create our consumer
    const consumer = (client as Kafka).consumer(consumerConfig);

    // connect our consumer and subscribe
    await consumer.connect();
    await consumer.subscribe({
        topic,
        fromBeginning
    });

    return new ConsumerStream(consumer, topic, {
        highWaterMark,
        autoResume,
        resumeAfter
    });
};
