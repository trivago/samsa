import { TransformCallback } from "stream";
import { ObjectTransform } from "../utils/ObjectTransform";

export const bufferTime = (timeSpan: number) => {
    let buffer: any[] = [];
    let interval: NodeJS.Timeout;

    const out = new ObjectTransform({
        transform(data: any, _: any, next: TransformCallback) {
            buffer.push(data);

            next();
        },
        flush(next: TransformCallback) {
            this.push(buffer);

            clearInterval(interval);

            next();
        }
    });

    interval = setInterval(() => {
        out.push(buffer);
        buffer = [];
    }, timeSpan);

    return out;
};
