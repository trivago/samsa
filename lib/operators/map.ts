import { Transform } from "stream";

export type MapCallback<T extends any, R extends any> = (
    data: T,
    encoding?: string
) => R;

/**
 * Maps incoming data
 * @param cb callback that takes the data — and optionally encoding — and maps it to something new
 */
export const map = <T extends any, R extends any>(cb: MapCallback<T, R>) =>
    new Transform({
        objectMode: true,
        transform(data, encoding, next) {
            next(null, cb(data, encoding));
        }
    });
