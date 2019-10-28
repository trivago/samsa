import { createReadStream } from "./stream.setup";
import { pipe } from "../pipe";
import { map } from "../map";

describe("Operator: pipe", () => {
    const stream = createReadStream();
    it("should pipe multiple operators", () => {
        const results: number[] = [];
        const double = map<number, number>(n => n * 2);

        const doubleTwice = pipe(
            double,
            double
        );

        stream.pipe(doubleTwice);

        stream.on("data", results.push);

        stream.on("close", () => {
            expect(results).toEqual([0, 4, 8, 12, 16, 20, 24, 28, 32, 36]);
        });
    });
});
