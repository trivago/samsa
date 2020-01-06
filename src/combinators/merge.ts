import { Readable, PassThrough } from "stream";

/**
 * Merge 1 or more streams into a single stream of values
 * @param streams
 */
export const merge = (...streams: Readable[]) => {
    const output = new PassThrough({
        objectMode: true
    });
    let sources: Readable[] = [];

    add(streams);

    function add(source: Readable | Readable[]) {
        if (Array.isArray(source)) {
            for (const stream of source) {
                add(stream);
            }
            return;
        }

        sources.push(source);
        source.once("end", () => {
            remove(source);
        });
        source.once("error", () => {
            output.emit("error");
        });
        source.pipe(
            output,
            { end: false }
        );
    }

    function remove(source: Readable) {
        sources = sources.filter(it => it !== source);
        if (sources.length === 0 && output.readable) {
            output.end();
        }
    }

    return output;
};
