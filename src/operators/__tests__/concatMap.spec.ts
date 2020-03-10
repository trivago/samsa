import { concatMap } from "../concatMap";
import { from } from "../../creators";
import { createReadStream, slowCountStream } from "./stream.setup";

describe("Operator: concatMap", () => {
    it("should concat multiple streams", done => {
        expect.assertions(1);

        const stream = createReadStream(2);

        const concattedStreams = stream.pipe(
            concatMap(n => {
                return createReadStream(5);
            })
        );

        const actualOutput: number[] = [];

        concattedStreams.on("data", data => {
            actualOutput.push(data);
        });

        concattedStreams.on("end", () => {
            expect(actualOutput).toEqual([0, 1, 2, 3, 4, 0, 1, 2, 3, 4]);
            done();
        });
    });

    it("should concat a lot of streams", done => {
        expect.assertions(1);

        const stream = createReadStream(100);

        const concattedStreams = stream.pipe(
            concatMap(n => createReadStream(5))
        );

        const actualOutput: number[] = [];

        concattedStreams.on("data", data => {
            actualOutput.push(data);
        });

        concattedStreams.on("end", () => {
            expect(actualOutput).toEqual(
                Array.from(Array(100), () => [0, 1, 2, 3, 4]).reduce(
                    (acc, val) => acc.concat(val),
                    []
                )
            );
            done();
        });
    });

    it("can handle async calls", done => {
        expect.assertions(1);
        const stream = createReadStream(5);

        const mappedStream = stream.pipe(
            concatMap(n => {
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
            expect(actualOutput).toEqual([0, 1, 2, 3, 4]);
            done();
        });
    });

    it("can map from slow streams", done => {
        expect.assertions(1);
        const stream = slowCountStream(5);

        const mappedStream = stream.pipe(
            concatMap(n => {
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
            expect(actualOutput).toEqual([0, 1, 2, 3, 4, 5]);
            done();
        });
    });
});
