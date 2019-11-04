import { Readable, PassThrough } from "stream";

/**
 * Merge 1 or more streams into a single stream of values
 * @param streams
 */
export const merge = (...streams: Readable[]) => {
    const output = new PassThrough({ objectMode: true });
    let sources: Readable[] = [];

    for (const stream of streams) {
        sources.push(stream);
        stream.once("error", err => {
            output.emit("error", err);
        });
        stream.once("close", () => {
            remove(stream);
        });
        stream.pipe(
            output,
            { end: false }
        );
    }

    function remove(stream: Readable) {
        sources = sources.filter(source => source !== stream);
        if (sources.length === 0) {
            output.end();
        }
    }

    return output;
};
