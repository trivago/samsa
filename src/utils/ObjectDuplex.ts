import { Duplex, DuplexOptions } from "stream";

/**
 * A duplex stream that automatically accepts objects
 */

export class ObjectDuplex extends Duplex {
    constructor(options: DuplexOptions = {}) {
        super({
            ...options,
            objectMode: true
        });
    }
}
