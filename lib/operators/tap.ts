import { Transform } from "stream";

export type TapCallback = (data: any, encoding?: string) => any;

/**
 * Cause a side effect and return the data to the next processor
 * @param cb callback that takes the data — and optionally encoding — and causes some side effect
 */
export const tap = (cb: TapCallback) =>
    new Transform({
        objectMode: true,
        transform(data, encoding, next) {
            cb(data, encoding);
            next(null, data);
        }
    });
