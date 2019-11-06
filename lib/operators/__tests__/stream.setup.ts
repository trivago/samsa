import { Readable } from "stream";

export const createReadStream = () => {
    const max = 10;
    let count = 0;
    const stream = new Readable({
        objectMode: true,
        read() {
            count++;
            if (count < max) {
                this.push(count);
            } else {
                this.push(null);
            }
        }
    });

    return stream;
};
