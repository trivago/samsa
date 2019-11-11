import { createReadStream } from "./stream.setup";
import { skipFirst } from "../skipFirst";

describe("Operator: skipFirst", () => {
    it("should skip the first value", done => {
        const stream = createReadStream();
        expect.assertions(1);
        const results: number[] = [];
        const skipped = stream.pipe(skipFirst());

        skipped.on("data", d => {
            results.push(d);
        });

        skipped.on("finish", () => {
            expect(results).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            done();
        });
    });
    it("should handle more than 16 objects", done => {
        const stream = createReadStream(17);
        expect.assertions(1);
        const expected = Array.from(Array(17), (_, i) => i).filter(i => i > 0);
        const results: number[] = [];
        const skipped = stream.pipe(skipFirst());

        skipped.on("data", d => {
            results.push(d);
        });

        skipped.on("finish", () => {
            expect(results).toEqual(expected);
            done();
        });
    });
    it("should handle a large amount of data", done => {
        const stream = createReadStream(1e6);
        expect.assertions(1);
        const expected = Array.from(Array(1e6 - 1), (_, i) => i + 1);
        const results: number[] = [];
        const skipped = stream.pipe(skipFirst());

        skipped.on("data", d => {
            results.push(d);
        });

        skipped.on("finish", () => {
            expect(results).toEqual(expected);
            done();
        });
    });
});
