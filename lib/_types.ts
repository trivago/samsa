import { ConsumerConfig } from "kafkajs";
export interface Message {
    key: string | Buffer;
    value: any;
    partition: number;
    topic: string;
    offset: string;
}

export interface StreamConfig extends ConsumerConfig {
    topic: string;
    fromBeginning?: boolean;
    highWaterMark?: number;
    autoResume?: boolean;
    retryIn?: number;
}
