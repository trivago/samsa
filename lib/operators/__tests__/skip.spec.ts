import { createReadStream } from "./stream.setup";
import { skip } from "../skip";

describe("Operator: skip", () => {
    const stream = createReadStream();
    it("should skip the first 5 values", () => {
        const results: number[] = [];
        stream.pipe(skip(5));

        stream.on("data", results.push);

        stream.on("close", () => {
            expect(results).toEqual([5, 6, 7, 8, 9]);
        });
    });
});
