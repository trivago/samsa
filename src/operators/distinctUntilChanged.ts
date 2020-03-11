import { ObjectTransform } from "../utils/ObjectTransform";
import { TransformCallback } from "stream";

type ComparatorFunction = (prev: any, curr: any) => boolean;

const defaultComparator: ComparatorFunction = (prev, curr) => prev !== curr;

export const distinctUntilChanged = (
    compare: ComparatorFunction = defaultComparator
) => {
    let value: any = null;

    return new ObjectTransform({
        transform(data: any, _: any, next: TransformCallback) {
            if (value === null || compare(value, data)) {
                this.push(data);
                value = data;
            }
            next();
        }
    });
};
