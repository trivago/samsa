import { createReadStream } from "./stream.setup";
import { mergeMap } from "../mergeMap";

describe("Operator: mergeMap", () => {
    it("Should merge to a new stream", done => {
        expect.assertions(1);

        const stream = createReadStream(1);

        const mappedStream = stream.pipe(
            mergeMap(n => {
                return createReadStream(3);
            })
            // { end: false }
        );

        const actualOutput: number[] = [];

        mappedStream.on("data", data => {
            actualOutput.push(data);
        });

        mappedStream.on("end", () => {
            expect(actualOutput).toEqual([0, 1, 2]);
            done();
        });
    });

    it("Should merge multiple new streams", done => {
        expect.assertions(1);

        const stream = createReadStream(3);

        const mappedStream = stream.pipe(
            mergeMap(n => {
                return createReadStream(3);
            })
        );

        const actualOutput: number[] = [];

        mappedStream.on("data", data => {
            actualOutput.push(data);
        });

        mappedStream.on("end", () => {
            expect(actualOutput).toEqual([0, 1, 2, 0, 1, 2, 0, 1, 2]);
            done();
        });
    });

    it("should merge lots of new streams", done => {
        expect.assertions(1);
        const stream = createReadStream(100);

        const mappedStream = stream.pipe(
            mergeMap(n => {
                return createReadStream(100);
            })
        );

        const actualOutput: number[] = [];

        mappedStream.on("data", data => {
            actualOutput.push(data);
        });

        mappedStream.on("end", () => {
            expect(actualOutput).toEqual(
                Array.from(Array(100), () =>
                    Array.from(Array(100), (_, i) => i)
                ).reduce((acc, val) => acc.concat(val), [])
            );
            done();
        });
    });
});
