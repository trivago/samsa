import { createReadStream } from "./stream.setup";
import { switchMap } from "../switchMap";

describe("Operator: switchMap", () => {
    it("Should switch to a new stream", done => {
        expect.assertions(1);

        const stream = createReadStream(1);

        const switchedStream = stream.pipe(
            switchMap(n => {
                return createReadStream(3);
            })
            // { end: false }
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

    it("Should switch to a new stream multiple times", done => {
        expect.assertions(1);

        const stream = createReadStream(3);

        const switchedStream = stream.pipe(
            switchMap(n => {
                return createReadStream(3);
            })
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

    it("should switch to a new stream a lot of times", done => {
        expect.assertions(1);
        const stream = createReadStream(100);

        const switchedStream = stream.pipe(
            switchMap(n => {
                return createReadStream(100);
            })
        );

        const actualOutput: number[] = [];

        switchedStream.on("data", data => {
            actualOutput.push(data);
        });

        switchedStream.on("end", () => {
            expect(actualOutput).toEqual(
                Array.from(Array(100), () =>
                    Array.from(Array(100), (_, i) => i)
                ).reduce((acc, val) => acc.concat(val))
            );
            done();
        });
    });
});
