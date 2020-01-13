import { ObjectTransform } from "../utils/ObjectTransform";
import { Readable, TransformCallback } from "stream";

interface CurrentReader {
    reader: Readable;
    listener: (chunk: any) => void;
}

export const switchMap = (project: (t: any) => Readable) => {
    let currentReader: Readable | null = null;

    const out = new ObjectTransform({
        transform(data, _: any, next: TransformCallback) {
            const reader = project(data);

            if (currentReader) {
                currentReader.removeAllListeners();
            }

            currentReader = reader;

            reader.on("data", innerData => {
                this.push(innerData);
            });

            reader.on("end", () => {
                currentReader = null;
            });

            reader.on("error", err => {
                this.emit("error", err);
            });

            return next();
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
