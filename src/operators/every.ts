import { Readable, TransformCallback } from "stream";
import { ObjectTransform } from "./../utils/ObjectTransform";

export type Predicate = (data: any) => boolean;

export const every = (predicate: Predicate) => {
    let check = true;
    let source: Readable;

    const out = new ObjectTransform({
        transform(data: any, _: any, next: TransformCallback) {
            check = predicate(data);

            if (!check) {
                source.unpipe(out);
                this.push(false);
                this.push(null);
            }

            next();
        },
        final(next: TransformCallback) {
            this.push(true);
            next();
        }
    });

    out.on("pipe", src => {
        source = src;
    });

    return out;
};
