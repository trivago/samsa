import { ObjectTransform } from "../utils/ObjectTransform";
import { PassThrough, Readable, TransformCallback } from "stream";

export const switchMap = (project: (t: any) => Readable) => {
    let currentReader: Readable | null = null;
    let streamRegister: Readable[] = [];
    let sourceEnded = false;

    const out = new ObjectTransform({
        transform(data, _: any, next: TransformCallback) {
            const reader = project(data);

            if (currentReader) {
                currentReader.removeAllListeners();
                streamRegister = streamRegister.filter(
                    r => r !== currentReader
                );
            }

            streamRegister.push(reader);

            currentReader = reader;

            reader.on("data", innerData => {
                this.push(innerData);
            });

            reader.on("end", () => {
                currentReader = null;
                streamRegister = streamRegister.filter(r => r !== reader);
                if (sourceEnded && streamRegister.length === 0) {
                    this.push(null);
                }
            });

            reader.on("error", err => {
                this.emit("error", err);
            });

            return next();
        }
    });

    const redirectedInput = new PassThrough({ objectMode: true });

    redirectedInput.pipe(out);

    out.on("pipe", source => {
        source.unpipe(out);
        source.pipe(
            redirectedInput,
            { end: false }
        );

        source.on("end", () => {
            sourceEnded = true;
            if (streamRegister.length === 0) {
                out.push(null);
            }
        });
    });

    return out;
};
