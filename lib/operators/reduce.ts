import { Transform } from "stream";

export type ReduceCallback<T extends any, A extends any> = (
    accumulator: A,
    value: T,
    encoding?: string
) => A;

/**
 * Accumulates the incoming data according to the callback passed. The accumulated value will
 * be returned once no more data has been written.
 * @param callback
 */
export const reduce = <T extends any, A extends any>(
    callback: ReduceCallback<T, A>
) => {
    let result = {};

    return new Transform({
        objectMode: true,
        transform(data, encoding, next) {
            result = callback(result as any, data, encoding);
            next();
        },
        flush(next) {
            next(null, result);
        }
    });
};
