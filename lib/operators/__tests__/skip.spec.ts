import { createReadStream } from "./stream.setup";
import { skip } from "../skip";

describe("Operator: skip", () => {
    const stream = createReadStream();
    it("should skip the first 5 values", done => {
        expect.assertions(1);
        const results: number[] = [];

        const skipped = stream.pipe(skip(5));

        skipped.on("data", d => {
            results.push(d);
        });

        skipped.on("finish", () => {
            expect(results).toEqual([6, 7, 8, 9]);
            done();
        });
    });
});
