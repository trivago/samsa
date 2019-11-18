import { Transform, TransformOptions, TransformCallback } from "stream";

type ObjectTransformCallback = (data: any, next: TransformCallback) => void;

export class ObjectTransform extends Transform {
    constructor(options: TransformOptions = {}) {
        super({
            ...options,
            objectMode: true
        });
    }
}

export const createObjectTransform = (transform: ObjectTransformCallback) =>
    new ObjectTransform({
        transform(data, _, next) {
            transform(data, next);
        }
    });
