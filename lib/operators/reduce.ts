import { Transform } from "stream";

export type ReduceCallback<T extends any, A extends any> = (
    accumulator: A,
    value: T,
    encoding?: string
) => A;

/**
 * Reduces the incoming data to a single value and outputs that data once all data has been consumed
 * @param cb callback used to reduce incoming data
 */
export const reduce = <T extends any, A extends any>(
    cb: ReduceCallback<T, A>
) => {
    let result = {};

    return new Transform({
        objectMode: true,
        transform(data, encoding, next) {
            result = cb(result as any, data, encoding);
            next();
        },
        flush(next) {
            next(null, result);
        }
    });
};
