import { Transform, PassThrough } from "stream";

export const pipe = (...ops: Transform[]) => {
    const ps = new PassThrough({ objectMode: true });
    ops.forEach(op => {
        ps.pipe(op);
    });
    return ps;
};
