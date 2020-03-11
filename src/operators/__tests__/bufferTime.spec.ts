import { ObjectReadable } from "./../../utils/ObjectReadable";
import { bufferTime } from "../bufferTime";
import { range } from "../../creators";

const cancelableInterval = (n: number, stopSignal: ObjectReadable) => {
    let count = 0;
    const out = new ObjectReadable({
        read() {}
    });

    const i = setInterval(() => {
        out.push(count);
        count++;
    }, n);

    stopSignal.once("data", () => {
        clearInterval(i);
        out.push(null);
    });

    return out;
};

describe("Operator: bufferTime", () => {
    it("should properly buffer data based on a time interval", done => {
        const cancel = new ObjectReadable({ read() {} });
        const i = cancelableInterval(100, cancel);

        i.pipe(bufferTime(1100)).once("data", data => {
            cancel.push(true);
            expect(Array.isArray(data)).toEqual(true);
            expect(data.length).toEqual(10);
            done();
        });
    });

    it("should empty it's buffer if the input ends", done => {
        const i = range(0, 10);

        i.pipe(bufferTime(1000)).once("data", data => {
            expect(Array.isArray(data)).toEqual(true);
            expect(data.length).toEqual(11);
            done();
        });
    });
});
