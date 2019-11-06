import { ReduceCallback } from "./../reduce";
import { scan } from "../scan";
import { createReadStream } from "./stream.setup";

describe("Operator: scan", () => {
    const stream = createReadStream();

    it("should scan over an accumulator", done => {
        expect.assertions(1);
        let results: number[] = [];

        const add: ReduceCallback<number, number> = (a, v) => a + v;

        const scanned = stream.pipe(scan(add, 0));

        scanned.on("data", data => {
            results.push(data);
        });

        scanned.on("finish", () => {
            expect(results).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45]);
            done();
        });
    });
});
