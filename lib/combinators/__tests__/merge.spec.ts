import { createReadStream } from "./stream.setup";
import { merge } from "../merge";

describe("Combinator: merge", () => {
    it("should merge 2 streams", done => {
        const _expected = Array.from(Array(10), (_, i) => i);

        const stream1 = createReadStream();
        const stream2 = createReadStream();
        expect.assertions(1);
        const result: number[] = [];
        const expected = [..._expected, ..._expected];

        const merged = merge(stream1, stream2);

        merged.on("data", d => {
            result.push(d);
        });

        merged.on("finish", () => {
            expect(result).toEqual(expected);
            done();
        });
    });
    it("should merge more than 2 streams", done => {
        const _expected = Array.from(Array(10), (_, i) => i);

        expect.assertions(1);
        const stream1 = createReadStream();
        const stream2 = createReadStream();
        const stream3 = createReadStream();

        const result: number[] = [];
        const expected = [..._expected, ..._expected, ..._expected];

        const merged = merge(stream1, stream2, stream3);

        merged.on("data", d => {
            result.push(d);
        });

        merged.on("finish", () => {
            expect(result).toEqual(expected);
            done();
        });
    });

    it("should merge streams larger than 16 objects", done => {
        const _expected = Array.from(Array(17), (_, i) => i);
        const stream1 = createReadStream(false, 17);
        const stream2 = createReadStream(false, 17);
        const expected = [..._expected, ..._expected];
        const result: number[] = [];

        expect.assertions(1);

        const merged = merge(stream1, stream2);

        merged.on("data", d => {
            result.push(d);
        });

        merged.on("finish", () => {
            expect(result).toEqual(expected);
            done();
        });
    });
    it("should merge streams with a large amount of data", done => {
        const _expected = Array.from(Array(1e6), (_, i) => i);
        const stream1 = createReadStream(false, 1e6);
        const stream2 = createReadStream(false, 1e6);
        const expected = [..._expected, ..._expected];
        const result: number[] = [];

        expect.assertions(1);

        const merged = merge(stream1, stream2);

        merged.on("data", d => {
            result.push(d);
        });

        merged.on("finish", () => {
            expect(result).toEqual(expected);
            done();
        });
    });
});
