import { ObjectTransform } from "../utils/ObjectTransform";
import { TransformCallback } from "stream";

export const bufferCount = (bufferSize: number) => {
    let buffer: any[] = [];

    return new ObjectTransform({
        transform(data: any, _: any, next: TransformCallback) {
            buffer.push(data);

            if (buffer.length === bufferSize) {
                this.push(buffer);
                buffer = [];
            }

            next();
        },
        flush(next: TransformCallback) {
            this.push(buffer);
            next();
        }
    });
};
