import { Readable } from "stream";

export const createReadStream = () => {
    const stream = new Readable({ objectMode: true, read() {} });

    for (let i = 0; i < 10; i++) {
        stream.push(i);
    }

    return stream;
};
