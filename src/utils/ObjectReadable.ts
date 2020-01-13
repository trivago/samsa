import { Readable, ReadableOptions } from "stream";

/**
 * A readable stream that automatically accepts objects
 */
export class ObjectReadable extends Readable {
    constructor(options: ReadableOptions = {}) {
        super({
            ...options,
            objectMode: true
        });
    }
}
