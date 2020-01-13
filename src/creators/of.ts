import { ObjectReadable } from "../utils/ObjectReadable";

export const of = <T extends any>(...values: T[]) => {
    const _values = Array.from(values);

    return new ObjectReadable({
        read() {
            const next = _values.shift();
            if (next != null) {
                process.nextTick(() => this.push(next));
            } else {
                process.nextTick(() => this.push(null));
            }
        }
    });
};
