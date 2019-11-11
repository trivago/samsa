import { createReadStream } from "./stream.setup";
import { skip } from "../skip";

describe("Operator: skip", () => {
    it("should skip the first 5 values", done => {
        const stream = createReadStream();
        expect.assertions(1);
        const results: number[] = [];

        const skipped = stream.pipe(skip(5));

        skipped.on("data", d => {
            results.push(d);
        });

        skipped.on("finish", () => {
            expect(results).toEqual([5, 6, 7, 8, 9]);
            done();
        });
    });
    it("should handle more than 16 objects", done => {
        const stream = createReadStream(17);
        expect.assertions(1);
        const expected = Array.from(Array(17 - 5), (_, i) => i + 5);
        const results: number[] = [];

        const skipped = stream.pipe(skip(5));

        skipped.on("data", d => {
            results.push(d);
        });

        skipped.on("finish", () => {
            expect(results).toEqual(expected);
            done();
        });
    });
    it("should handle a large amount of objects", done => {
        const stream = createReadStream(1e6);
        expect.assertions(1);
        const expected = Array.from(Array(1e6 - 1e2), (_, i) => i + 1e2);
        const results: number[] = [];

        const skipped = stream.pipe(skip(1e2));

        skipped.on("data", d => {
            results.push(d);
        });

        skipped.on("finish", () => {
            expect(results).toEqual(expected);
            done();
        });
    });
});
