import { ObjectTransform } from "../utils/ObjectTransform";

export type MapCallback<T extends any, R extends any> = (data: T) => R;

/**
 * Transforms data coming in according to the projection passed.
 * @param projection
 */
export const map = <T extends any, R extends any>(project: MapCallback<T, R>) =>
    new ObjectTransform({
        transform(data, _, next) {
            this.push(project(data));
            next();
        }
    });
