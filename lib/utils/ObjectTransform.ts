import { Transform, TransformOptions, TransformCallback } from "stream";

/**
 * A transform stream that automatically accepts objects
 */
export class ObjectTransform extends Transform {
    constructor(options: TransformOptions = {}) {
        super({
            ...options,
            objectMode: true
        });
    }
}
