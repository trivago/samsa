import { ObjectTransform } from "../utils/ObjectTransform";
import { Readable, TransformCallback } from "stream";

export const concatMap = (project: (t: any) => Readable) => {
    let streamRegister: Readable[] = [];
    let currentReader: Readable | null = null;

    const out = new ObjectTransform({
        transform(data, _: any, next: TransformCallback) {
            this.cork();

            const reader = project(data);

            reader.on("data", innerData => {
                this.push(innerData);
            });

            reader.on("end", () => {
                this.uncork();
            });

            next();
        }
    });

    out.on("pipe", source => {
        source.on("end", () => {
            // @see mergeMap.ts#L32
            // @ts-ignore
            out._readableState.ended = false;
            // @ts-ignore
            out._writableState.ended = false;
        });
    });

    return out;
};
