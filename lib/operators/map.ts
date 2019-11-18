import {
    ObjectTransform,
    createObjectTransform
} from "./../utils/ObjectTransform";
import { Transform } from "stream";

export type MapCallback<T extends any, R extends any> = (data: T) => R;

/**
 * Transforms data coming in according to the projection passed.
 * @param projection
 */
// export const map = <T extends any, R extends any>(project: MapCallback<T, R>) =>
//     new Transform({
//         objectMode: true,
//         transform(data, encoding, next) {
//             this.push(project(data, encoding));
//             next();
//         }
//     });

export const map = <T extends any, R extends any>(project: MapCallback<T, R>) =>
    createObjectTransform(function(data, next) {
        next(undefined, project(data));
    });
