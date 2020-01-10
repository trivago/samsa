import { ObjectReadable } from "../utils/ObjectReadable";
import { Readable } from "stream";

export const from = <T extends any>(ish: Iterable<T> | Promise<T> | T[]) => {
    if (Array.isArray(ish)) {
        const _values = Array.from(ish);
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
    }
    if (ish instanceof Promise) {
        return new ObjectReadable({
            read: async function read() {
                try {
                    const value = await ish;
                    process.nextTick(() => this.push(value));
                    process.nextTick(() => this.push(null));
                } catch (err) {
                    this.destroy(err);
                }
            }
        });
    }
    if (ish.hasOwnProperty(Symbol.iterator)) {
        if (Readable.hasOwnProperty("from")) {
            return Readable.from(ish);
        } else {
            return new ObjectReadable({
                read() {
                    for (const value of ish) {
                        process.nextTick(() => this.push(value));
                    }
                    process.nextTick(() => this.push(null));
                }
            });
        }
    }
};
