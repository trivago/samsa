import { createReadStream } from "./stream.setup";
import { merge } from "../merge";

describe("Combinator: merge", () => {
    const stream1 = createReadStream();
    const stream2 = createReadStream();
    const _expected = Array.from(Array(10), (_, i) => i);
    it("should merge 2 streams", () => {
        const result: number[] = [];
        const expected = [..._expected, ..._expected];

        const merged = merge(stream1, stream2);

        merged.on("data", result.push);

        merged.on("close", () => {
            expect(result).toEqual(expected);
        });
    });
    it("should merge more than 2 streams", () => {
        const result: number[] = [];
        const stream3 = createReadStream();
        const expected = [..._expected, ..._expected, ..._expected];

        const merged = merge(stream1, stream2, stream3);

        merged.on("data", result.push);

        merged.on("close", () => {
            expect(result).toEqual(expected);
        });
    });
});
