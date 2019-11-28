import { StreamErrorCallback } from "./../_types";
import { Writable, WritableOptions } from "stream";

type ObjectWritableCallback = (data: any, next: StreamErrorCallback) => void;

/**
 * A writable stream that accepts objects by default
 */
export class ObjectWritable extends Writable {
    constructor(options: WritableOptions = {}) {
        super({
            ...options,
            objectMode: true
        });
    }
}
