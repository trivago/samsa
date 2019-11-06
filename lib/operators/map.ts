import { Transform } from "stream";

export type MapCallback<T extends any, R extends any> = (
    data: T,
    encoding?: string
) => R;

/**
 * Transforms data coming in according to the callback passed.
 * @param callback
 */
export const map = <T extends any, R extends any>(
    callbcak: MapCallback<T, R>
) =>
    new Transform({
        objectMode: true,
        transform(data, encoding, next) {
            if (data === null) {
                next(null, null);
            } else {
                next(null, callbcak(data, encoding));
            }
        }
    });
