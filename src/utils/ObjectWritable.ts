import { Writable, WritableOptions } from "stream";

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
