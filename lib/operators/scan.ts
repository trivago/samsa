import { Transform } from "stream";
import { ReduceCallback } from "./reduce";

/**
 * Reduces the incoming data to a single value and outputs that data over time
 * @param cb callback used to reduce incoming data
 */
export const scan = <T extends any, A extends any>(
    cb: ReduceCallback<T, A>
) => {
    let result = {};

    return new Transform({
        objectMode: true,
        transform(data, encoding, next) {
            result = cb(result as any, data, encoding);
            next(null, result);
        }
    });
};
