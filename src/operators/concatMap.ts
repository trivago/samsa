import { ObjectTransform } from "../utils/ObjectTransform";
import { Readable, TransformCallback, PassThrough } from "stream";

export const concatMap = (project: (t: any) => Readable) => {
    let streamRegister: Readable[] = [];

    const out = new ObjectTransform({
        transform(data, _: any, next: TransformCallback) {
            this.cork();

            const reader = project(data);
            streamRegister.push(reader);

            reader.on("data", innerData => {
                this.push(innerData);
            });

            reader.on("end", () => {
                this.uncork();
                streamRegister = streamRegister.filter(r => r !== reader);
                if (streamRegister.length === 0) {
                    this.push(null);
                }
            });

            reader.on("error", err => {
                this.emit("error", err);
            });

            next();
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
    });
    return out;
};
