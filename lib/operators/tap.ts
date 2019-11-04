import { Transform } from "stream";

export type TapCallback = (data: any, encoding?: string) => any;

/**
 * Perform actions or side-effects without transforming the data
 * @param callback
 */
export const tap = (callback: TapCallback) =>
    new Transform({
        objectMode: true,
        transform(data, encoding, next) {
            callback(data, encoding);
            next(null, data);
        }
    });
