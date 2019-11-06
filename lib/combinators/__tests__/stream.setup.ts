import { Readable } from "stream";

export const createReadStream = (kv: boolean = false) => {
    const max = 10;
    let count = 0;
    const stream = new Readable({
        objectMode: true,
        read() {
            count++;
            if (count < max) {
                if (kv) {
                    this.push({
                        key: count,
                        value: count
                    });
                } else {
                    this.push(count);
                }
            } else {
                this.push(null);
            }
        }
    });

    return stream;
};
