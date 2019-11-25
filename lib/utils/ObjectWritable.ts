import { StreamErrorCallback } from "./../_types";
import { Writable, WritableOptions } from "stream";

type ObjectWritableCallback = (data: any, next: StreamErrorCallback) => void;

export class ObjectWritable extends Writable {
    constructor(options: WritableOptions = {}) {
        super({
            ...options,
            objectMode: true
        });
    }
}

export const createObjectWritable = (write: ObjectWritableCallback) =>
    new ObjectWritable({
        write(data, _, next) {
            write(data, next);
        }
    });
