import { createReadStream } from "./stream.setup";
import { filter, FilterPredicate } from "../filter";

describe("Operator: filter", () => {
    const stream = createReadStream();

    it("should filter based on a predicate", done => {
        expect.assertions(1);
        const predicate: FilterPredicate<number> = n => n % 2 === 0;

        let result: number[] = [];

        const filtered = stream.pipe(filter(predicate));

        filtered.on("data", d => result.push(d));

        filtered.on("finish", () => {
            expect(result).toEqual([2, 4, 6, 8]);
            done();
        });
    });
});
