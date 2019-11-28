import { ObjectTransform } from "../utils/ObjectTransform";

export type FilterPredicate<T extends any> = (
    data: T,
    encoding?: string
) => boolean;

/**
 * Removes unwanted values from a stream that don't satisfy the given function
 * @param predicate
 */
export const filter = <T extends any>(predicate: FilterPredicate<T>) =>
    new ObjectTransform({
        transform(data, encoding, next) {
            if (predicate(data)) {
                this.push(data);
            }
            next();
        }
    });
