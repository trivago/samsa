import { TransformCallback } from "stream";
import { ObjectTransform } from "../utils/ObjectTransform";

export const ignoreElements = () =>
    new ObjectTransform({
        transform(_: any, __: any, next: TransformCallback) {
            next();
        }
    });
