import { ObjectTransform } from "../utils/ObjectTransform";

/**
 * Skips a given number of objects
 * @param n chunks to skip
 */
export const skip = (n: number) => {
    let toSkip = 0;

    return new ObjectTransform({
        transform(data, _, next) {
            if (toSkip < n) {
                toSkip++;
                next();
            } else {
                this.push(data);
                next();
            }
        }
    });
};
