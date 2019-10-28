import { createReadStream } from "./stream.setup";
import { compose } from "../compose";
import { map } from "../map";

describe("Operator: compose", () => {
    const stream = createReadStream();
    it("should compose multiple operators", () => {
        const results: number[] = [];

        const double = map<number, number>(n => n * 2);
        const plusOne = map<number, number>(n => n + 1);
        const addOneThenDouble = compose(
            double,
            plusOne
        );

        stream.pipe(addOneThenDouble);

        stream.on("data", results.push);

        stream.on("close", () => {
            expect(results).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
        });
    });
});
