import { Readable, TransformCallback } from "stream";
import { ObjectReadable } from "../utils/ObjectReadable";
import { ObjectTransform } from "../utils/ObjectTransform";

export const mergeMap = (project: (t: any) => Readable) => {
    let streamRegister: Readable[] = [];

    const out = new ObjectTransform({
        transform(data, _: any, next: TransformCallback) {
            const reader = project(data);

            streamRegister.push(reader);

            reader.on("data", innerData => {
                this.push(innerData);
            });

            reader.on("end", () => {
                streamRegister = streamRegister.filter(i => i !== reader);
            });

            reader.on("error", err => {
                this.emit("error", err);
            });

            return next();
        }
    });

    out.on("pipe", source => {
        source.on("end", () => {
            /**
             * I'm so sorry.
             *
             * What the hell is happening here?
             *
             * This is a hack that prevents our source from forcing
             * our downstream to end. The problem is that if our source
             * stream ends while our stream register is still full, the
             * output stream will error out without emitting the remaining
             * values
             *
             * Example:
             *
             * range(0,20)
             *   .pipe(
             *      mergeMap(n => range(0,20))
             *   )
             *
             * This should output 0..20 20 times. Without the below hack, this
             * will fail once the first range is finished.
             */
            // @ts-ignore
            out._readableState.ended = false;
            // @ts-ignore
            out._writableState.ended = false;
        });
    });

    return out;
};
