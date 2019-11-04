import { Transform } from "stream";

/**
 * Skips a given number of objects
 * @param n chunks to skip
 */
export const skip = (n: number) => {
    let toSkip = 1;

    return new Transform({
        objectMode: true,
        transform(data, _, next) {
            if (toSkip < n) {
                toSkip++;
                next();
            } else {
                next(null, data);
            }
        }
    });
};
