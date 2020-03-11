import { TransformCallback } from "stream";
import { ObjectTransform } from "../utils/ObjectTransform";

type ComparatorFunction = (prev: any, curr: any) => boolean;

const defaultComparator: ComparatorFunction = (prev, curr) => prev !== curr;

export const distinctUntilKeyChanged = (
    key: string,
    compare: ComparatorFunction = defaultComparator
) => {
    let value: any = null;

    return new ObjectTransform({
        transform(data: any, _: any, next: TransformCallback) {
            if (
                value == null ||
                (data[key] != null && compare(value[key], data[key]))
            ) {
                this.push(data);
                value = data;
            }

            next();
        }
    });
};
