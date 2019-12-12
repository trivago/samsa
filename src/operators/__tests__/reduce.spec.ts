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

    it("should handle more than 16 objects", done => {
        expect.assertions(1);
        const stream = createReadStream(17);

        const expected = Array.from(Array(17), (_, i) => i).reduce(
            (acc, val) => acc + val,
            0
        );
        let result: number = 0;

        const reduced = stream.pipe(reduce((acc, val) => acc + val, 0));

        reduced.on("data", d => {
            result = d;
        });

        reduced.on("finish", () => {
            expect(result).toEqual(expected);
            done();
        });
    });
    it("should handle a large amount of objects", done => {
        expect.assertions(1);
        const stream = createReadStream(1e6);

        const expected = Array.from(Array(1e6), (_, i) => i).reduce(
            (acc, val) => acc + val,
            0
        );
        let result: number = 0;

        const reduced = stream.pipe(reduce((acc, val) => acc + val, 0));

        reduced.on("data", d => {
            result = d;
        });

        reduced.on("finish", () => {
            expect(result).toEqual(expected);
            done();
        });
    });
});
