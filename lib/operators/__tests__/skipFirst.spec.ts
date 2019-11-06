import { createReadStream } from "./stream.setup";
import { skipFirst } from "../skipFirst";

describe("Operator: skipFirst", () => {
    const stream = createReadStream();
    it("should skip the first value", done => {
        expect.assertions(1);
        const results: number[] = [];
        const skipped = stream.pipe(skipFirst());

        skipped.on("data", d => {
            results.push(d);
        });

        skipped.on("finish", () => {
            expect(results).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
            done();
        });
    });
});
