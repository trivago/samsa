import { Transform } from "stream";

export type FilterPredicate<T extends any> = (
    data: T,
    encoding?: string
) => boolean;

/**
 *
 * @param predicate
 */
export const filter = <T extends any>(predicate: FilterPredicate<T>) =>
    new Transform({
        objectMode: true,
        transform(data, encoding, next) {
            if (predicate(data, encoding)) {
                next(null, data);
            } else {
                next();
            }
        }
    });
