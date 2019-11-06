import { createReadStream } from "./stream.setup";
import { merge } from "../merge";

describe("Combinator: merge", () => {
    const _expected = Array.from(Array(9), (_, i) => i + 1);

    it("should merge 2 streams", done => {
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
});
