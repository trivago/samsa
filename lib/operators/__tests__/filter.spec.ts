import { createReadStream } from "./stream.setup";
import { filter, FilterPredicate } from "../filter";

describe("Operator: filter", () => {
    const stream = createReadStream();

    it("should filter based on a predicate", () => {
        const predicate: FilterPredicate<number> = n => n % 2 === 0;

        let result: number[] = [];

        stream.pipe(filter(predicate));

        stream.on("data", result.push);

        stream.on("close", () => {
            expect(result).toEqual([0, 2, 4, 6, 8]);
        });
    });
});
