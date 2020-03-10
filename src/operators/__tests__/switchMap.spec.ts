import { ObjectReadable } from "../../utils/ObjectReadable";
import { from } from "../../creators";
import { switchMap } from "../switchMap";
import { createReadStream, slowCountStream } from "./stream.setup";

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

    it("can handle async calls", done => {
        expect.assertions(1);
        const stream = createReadStream(5);

        const mappedStream = stream.pipe(
            switchMap(n => {
                return from(
                    new Promise((res, rej) => {
                        setTimeout(() => {
                            res(n);
                        }, 100 * n);
                    })
                );
            })
        );

        const actualOutput: number[] = [];

        mappedStream.on("data", data => {
            actualOutput.push(data);
        });

        mappedStream.on("end", () => {
            expect(actualOutput).toEqual([4]);
            done();
        });
    });

    it("can map from slow streams", done => {
        expect.assertions(1);
        const stream = slowCountStream(5);

        const mappedStream = stream.pipe(
            switchMap(n => {
                return from(
                    new Promise(res => {
                        setTimeout(() => {
                            res(n);
                        }, 100 * n);
                    })
                );
            })
        );

        const actualOutput: number[] = [];

        mappedStream.on("data", data => {
            actualOutput.push(data);
        });

        mappedStream.on("end", () => {
            // here we see that n = 0 resolves immediately
            // n = 1 will resolve after 100ms which is
            // enough time for the rest to try and resolve
            expect(actualOutput).toEqual([0, 1, 5]);
            done();
        });
    });
});
