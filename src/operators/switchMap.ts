import { ObjectTransform } from "../utils/ObjectTransform";
import { PassThrough, Readable, TransformCallback } from "stream";

export const switchMap = (project: (t: any) => Readable) => {
    let currentReader: Readable | null = null;
    const streamRegister: Set<Readable> = new Set();
    const sources: Set<Readable> = new Set();

    const out = new ObjectTransform({
        transform(data, _: any, next: TransformCallback) {
            const reader = project(data);

            if (currentReader) {
                currentReader.removeAllListeners();
                streamRegister.delete(currentReader);
            }

            streamRegister.add(reader);

            currentReader = reader;

            reader.on("data", innerData => {
                this.push(innerData);
            });

            reader.on("end", () => {
                currentReader = null;
                streamRegister.delete(reader);
                attemptClose();
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

        sources.add(source);

        source.on("end", () => {
            sources.delete(source);
            attemptClose();
        });
    });

    function attemptClose() {
        if (sources.size === 0 && streamRegister.size === 0) {
            out.push(null);
        }
    }

    return out;
};
