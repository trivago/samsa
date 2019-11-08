import { Transform } from "stream";

export type MapCallback<T extends any, R extends any> = (
    data: T,
    encoding?: string
) => R;

/**
 * Transforms data coming in according to the projection passed.
 * @param projection
 */
export const map = <T extends any, R extends any>(project: MapCallback<T, R>) =>
    new Transform({
        objectMode: true,
        transform(data, encoding, next) {
            if (data === null) {
                return next(null, null);
            } else {
                this.push(project(data, encoding));
                next();
            }
        }
    });
