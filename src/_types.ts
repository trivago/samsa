import { LevelUp } from "levelup";
import { AbstractLevelDOWN } from "abstract-leveldown";
import { ConsumerConfig, Batch } from "kafkajs";

/**
 * Describes a key that could possibly come from Kafka or another source.
 * Currently only supports strings and buffers
 */
export type Key = string | Buffer;

/**
 * Describes a map used to store keys along with a timestamp to determine
 * when the key was read
 */
export type KeyMap = Map<Key, number>;

export interface KeyValuePair {
    key: Key;
    value: any;
}

export interface ProducerKeyValuePair {
    key?: Key;
    value: any;
    headers?: {
        [key: string]: Buffer;
    };
    partition?: number;
    timestamp?: string;
}

/**
 * Describes a key value pair coming from KafkaJS, optionally contains the ability
 * to tell KafkaJS that a KVPair has been used and the offset should be committed.
 */
export interface Message extends KeyValuePair {
    commit?: () => void;
}

/**
 * Describes the projection used for joining two streams
 */
export type JoinProjection<P extends any, F extends any, R extends any> = (
    primary: P,
    foreign: F
) => R;

interface BatchConfig {
    batchSize?: number;
    batchAge?: number;
}

export type StoreConfig = LevelUp | AbstractLevelDOWN | string;

export interface KTableConfig extends BatchConfig {}

export interface SinkConfig extends BatchConfig {
    store?: StoreConfig;
    highWaterMark?: number;
}

export interface StreamConfig extends ConsumerConfig {
    topic: string;
    fromBeginning?: boolean;
    highWaterMark?: number;
    autoResume?: boolean;
    resumeAfter?: number;
}

export type StreamErrorCallback = (error?: Error | null) => void;
