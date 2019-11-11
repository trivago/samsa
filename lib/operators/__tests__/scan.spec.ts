import { ReduceCallback } from "./../reduce";
import { scan } from "../scan";
import { createReadStream } from "./stream.setup";

describe("Operator: scan", () => {
    it("should scan over an accumulator", done => {
        const stream = createReadStream();

        expect.assertions(1);
        let results: number[] = [];

        const add: ReduceCallback<number, number> = (a, v) => a + v;

        const scanned = stream.pipe(scan(add, 0));

        scanned.on("data", data => {
            results.push(data);
        });

        scanned.on("finish", () => {
            expect(results).toEqual([0, 1, 3, 6, 10, 15, 21, 28, 36, 45]);
            done();
        });
    });

    it("should handle more than 16 objects", done => {
        expect.assertions(1);
        const stream = createReadStream(17);
        let r = 0;
        const expected = Array.from(Array(17), (_, i) => i).reduce(
            (acc: number[], val: number) => {
                r += val;
                acc.push(r);
                return acc;
            },
            []
        );
        let results: number[] = [];

        const reduced = stream.pipe(scan((acc, val) => acc + val, 0));

        reduced.on("data", d => {
            results.push(d);
        });

        reduced.on("finish", () => {
            expect(results).toEqual(expected);
            done();
        });
    });
    it("should handle a large amount of objects", done => {
        expect.assertions(1);
        const stream = createReadStream(1e6);
        let r = 0;
        const expected = Array.from(Array(1e6), (_, i) => i).reduce(
            (acc: number[], val: number) => {
                r += val;
                acc.push(r);
                return acc;
            },
            []
        );
        let results: number[] = [];

        const reduced = stream.pipe(scan((acc, val) => acc + val, 0));

        reduced.on("data", d => {
            results.push(d);
        });

        reduced.on("finish", () => {
            expect(results).toEqual(expected);
            done();
        });
    });
});
