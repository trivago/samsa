import { ObjectReadable } from "../../utils/ObjectReadable";

import { switchMap } from "../switchMap";
import { createReadStream } from "./stream.setup";

const longCounter = () => {
    let count = 0;
    let max = 3;

    return new ObjectReadable({
        read() {
            setTimeout(() => {
                if (count < max) {
                    this.push(count);
                } else {
                    this.push(null);
                }
                count++;
            }, 1000);
        }
    });
};

describe("Operator: switchMap", () => {
    it("should switch to a new stream", done => {
        expect.assertions(1);

        const stream = createReadStream(1);

        const switchedStream = stream.pipe(
            switchMap(() => createReadStream(3))
        );

        const actualOutput: number[] = [];

        switchedStream.on("data", data => {
            actualOutput.push(data);
        });

        switchedStream.on("end", () => {
            expect(actualOutput).toEqual([0, 1, 2]);
            done();
        });
    });

    it("should switch to a new stream multiple times", done => {
        expect.assertions(1);

        const stream = createReadStream(3);

        const switchedStream = stream.pipe(
            switchMap(() => createReadStream(3))
        );

        const actualOutput: number[] = [];

        switchedStream.on("data", data => {
            actualOutput.push(data);
        });

        switchedStream.on("end", () => {
            expect(actualOutput).toEqual([0, 1, 2]);
            done();
        });
    });

    it("should switch to a new stream a lot of times", done => {
        expect.assertions(1);

        const stream = createReadStream(100);

        const switchedStream = stream.pipe(
            switchMap(() => createReadStream(100))
        );

        const actualOutput: number[] = [];

        switchedStream.on("data", data => {
            actualOutput.push(data);
        });

        switchedStream.on("end", () => {
            expect(actualOutput).toEqual(Array.from(Array(100), (_, i) => i));
            done();
        });
    });

    it("should allow inner streams to finish if given enough time", done => {
        expect.assertions(1);

        const stream = longCounter();

        const switchedStream = stream.pipe(
            switchMap(() => createReadStream(3))
        );

        const actualOutput: number[] = [];

        switchedStream.on("data", data => {
            actualOutput.push(data);
        });

        switchedStream.on("end", () => {
            expect(actualOutput).toEqual([0, 1, 2, 0, 1, 2, 0, 1, 2]);
            done();
        });
    });
});
