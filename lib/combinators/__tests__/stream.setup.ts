import { Readable } from "stream";

export const createReadStream = (kv: boolean = false) => {
    const stream = new Readable({ objectMode: true, read() {} });

    for (let i = 0; i < 10; i++) {
        if (kv) {
            stream.push({
                key: i,
                value: i
            });
        } else {
            stream.push(i);
        }
    }

    return stream;
};
