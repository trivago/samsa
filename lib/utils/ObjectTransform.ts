import { Transform, TransformOptions, TransformCallback } from "stream";

type ObjectTransformCallback = (data: any, next: TransformCallback) => void;

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
