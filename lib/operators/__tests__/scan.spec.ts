import { ReduceCallback, reduce } from "../reduce";
import { createReadStream } from "./stream.setup";

describe("Operator: reduce", () => {
    const stream = createReadStream();

    it("should reduce to a single value", () => {
        let results: number[] = [];

        const add: ReduceCallback<number, number> = (a, v) => a + v;

        stream.pipe(reduce(add));

        stream.on("data", results.push);

        stream.on("close", () => {
            expect(results).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45]);
        });
    });
});
