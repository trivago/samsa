import { TransformCallback } from "stream";
import { ObjectTransform } from "./../utils/ObjectTransform";

export const pluck = (...fields: (string | number)[]) =>
    new ObjectTransform({
        transform(data: any, _: any, next: TransformCallback) {
            let result = data;

            for (const field of fields) {
                result = result[field];
                if (result == null) {
                    break;
                }
            }
            if (result !== null) {
                this.push(result);
            }

            next();
        }
    });
