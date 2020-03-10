import { Readable, Transform } from "stream";

export const pipe = (first: Readable) => (...transforms: Transform[]) => {
    let out = first;

    for (const transform of transforms) {
        out = out.pipe(transform);
    }

    return out;
};
