import { Transform } from "stream";
import { ReduceCallback } from "./reduce";

/**
 * Like reduce, accumulates the incoming data according to the callback passed. However, unlike reduce,
 * scan will return the accumulated data over time.
 * @param callback callback used to reduce incoming data
 */
export const scan = <T extends any, A extends any>(
    callback: ReduceCallback<T, A>
) => {
    let result = {};

    return new Transform({
        objectMode: true,
        transform(data, encoding, next) {
            result = callback(result as A, data, encoding);
            next(null, result);
        }
    });
};
