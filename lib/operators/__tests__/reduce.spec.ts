import { ReduceCallback, reduce } from "../reduce";
import { createReadStream } from "./stream.setup";

describe("Operator: reduce", () => {
    const stream = createReadStream();

    it("should reduce to a single value", () => {
        let result: number;

        const add: ReduceCallback<number, number> = (a, v) => a + v;

        stream.pipe(reduce(add));

        stream.on("data", data => {
            result = data;
        });

        stream.on("close", () => {
            expect(result).toEqual(45);
        });
    });
});
