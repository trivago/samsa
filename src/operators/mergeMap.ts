import { Readable, TransformCallback, PassThrough } from "stream";
import { ObjectTransform } from "../utils/ObjectTransform";

export const mergeMap = (project: (t: any) => Readable) => {
    let streamRegister: Readable[] = [];

    const out = new ObjectTransform({
        transform(data: any, _: any, next: TransformCallback) {
            const reader = project(data);

            streamRegister.push(reader);

            reader.on("data", innerData => {
                this.push(innerData);
            });

            reader.on("end", () => {
                streamRegister = streamRegister.filter(i => i !== reader);
                if (streamRegister.length === 0) {
                    this.push(null);
                }
            });

            reader.on("error", err => {
                this.emit("error", err);
            });

            return next();
        }
    });

    /**
     * What is happening here?
     *
     * This is in response to a bug where if, for whatever reason, you were piping a
     * PipeThrough stream into a mergeMap, the end event would fire well before it should.
     *
     * So, we are redirecting the input source and explicitly telling it not to pass end
     * down the stream. This allows us to explicitly call end when we want to. See line 20. If
     * we still have streams in our register, we need to continue getting the data from them,
     * but if one of them ends, it will cause `out` to also end. This prevents that.
     */
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

export const flatMap = mergeMap;
