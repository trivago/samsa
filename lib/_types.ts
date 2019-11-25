import { ConsumerConfig } from "kafkajs";

export type Key = string | Buffer;

export interface Message extends KeyValuePair {
    commit?: () => void;
}

export interface KeyValuePair {
    key: Key;
    value: any;
}

export interface StreamConfig extends ConsumerConfig {
    topic: string;
    fromBeginning?: boolean;
    highWaterMark?: number;
    autoResume?: boolean;
    resumeAfter?: number;
}

export type StreamErrorCallback = (error?: Error | null) => void;
