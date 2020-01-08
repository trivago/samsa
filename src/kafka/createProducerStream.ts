import { ProducerKeyValuePair, StreamErrorCallback } from '../_types';
import { Kafka, KafkaConfig, Producer, CompressionTypes } from 'kafkajs';
import { Writable } from 'stream';

class ProducerStream extends Writable {
    constructor( private producer: Producer, private topic: string, private compression: CompressionTypes, highWaterMark: number) {
        super({ objectMode: true, highWaterMark });
    }

    private formatMessage(message: ProducerKeyValuePair) {
        return {
            topic: this.topic,
            compression: this.compression,
            messages: [ message ],
        }
    }

    async _write(data: ProducerKeyValuePair, _: any, next: StreamErrorCallback) {
        const message = this.formatMessage(data);

        try {
            const metaData = await this.producer.send(message);
            // @ts-ignore
            console.log(metaData[0].baseOffset);
            return next();
        } catch (err) {
            return next(err);
        }
    }

}

interface ProducerConfig {
    topic: string;
    compression?: CompressionTypes;
    highWaterMark?: number;
}

export const createProducerStream = async ( kafkaClientOrConfig: Kafka | KafkaConfig, producerConfig: ProducerConfig) => {
    const { 
        topic,
        compression = CompressionTypes.None,
        highWaterMark = 100000
    } = producerConfig;

    const client = kafkaClientOrConfig?.constructor?.name === 'Client'
        ? kafkaClientOrConfig
        : new Kafka(kafkaClientOrConfig as KafkaConfig);

    const producer = (client as Kafka).producer();

    await producer.connect();

    return new ProducerStream(producer, topic, compression, highWaterMark);
}