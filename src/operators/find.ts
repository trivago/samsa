import { Predicate } from "./every";
import { ObjectTransform } from "../utils/ObjectTransform";
import { Readable, TransformCallback } from "stream";

export const find = (predicate: Predicate) => {
    let source: Readable;

    const out = new ObjectTransform({
        transform(data: any, _: any, next: TransformCallback) {
            if (predicate(data)) {
                source.unpipe(this);

                this.push(data);
                this.push(null);
            }

            next();
        }
    });

    out.on("pipe", src => {
        source = src;
    });

    return out;
};
