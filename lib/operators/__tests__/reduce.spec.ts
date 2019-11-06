import { ReduceCallback, reduce } from "../reduce";
import { createReadStream } from "./stream.setup";

describe("Operator: reduce", () => {
    const stream = createReadStream();

    it("should reduce to a single value", done => {
        expect.assertions(1);
        let result: number;

        const add: ReduceCallback<number, number> = (a, v) => a + v;

        const reduced = stream.pipe(reduce(add, 0));

        reduced.on("data", data => {
            result = data;
        });

        reduced.on("finish", () => {
            expect(result).toEqual(45);
            done();
        });
    });
});
