import { ObjectTransform } from "../utils/ObjectTransform";

export type TapCallback = (data: any, encoding?: string) => any;

/**
 * Perform actions or side-effects without transforming the data
 * @param callback
 */
export const tap = (callback: TapCallback) =>
    new ObjectTransform({
        transform(data, encoding, next) {
            callback(data, encoding);
            this.push(data);
            next();
        }
    });
