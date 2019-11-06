import { Readable, Transform } from "stream";

/**
 * Merge 1 or more streams into a single stream of values
 * @param streams
 */
export const merge = (...streams: Readable[]) => {
    const output = new Transform({
        objectMode: true,
        transform(data, _, next) {
            next(null, data);
        }
    });
    let sources: Readable[] = [];

    for (const stream of streams) {
        sources.push(stream);
        stream.once("error", err => {
            output.emit("error", err);
        });
        stream.once("end", () => {
            sources = sources.filter(source => source !== stream);
        });
        stream.pipe(output);
    }

    return output;
};
