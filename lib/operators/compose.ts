import { Transform, PassThrough } from "stream";

export const compose = (...ops: Transform[]) => {
    const ps = new PassThrough({ objectMode: true });
    ops.reverse().forEach(op => {
        ps.pipe(op);
    });
    return ps;
};
