import { createReadStream } from "./stream.setup";
import { MapCallback, map } from "../map";

describe("Operator: map", () => {
    it("should map values to a new value", done => {
        const stream = createReadStream();

        expect.assertions(1);
        const result: number[] = [];

        const mapper: MapCallback<number, number> = n => n * 2;

        const mapped = stream.pipe(map(mapper));

        mapped.on("data", d => {
            result.push(d);
        });

        mapped.on("finish", () => {
            expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
            done();
        });
    });
    it("should handle more than 16 objects", done => {
        expect.assertions(1);
        const stream = createReadStream(17);

        const expected = Array.from(Array(17), (_, i) => i * 2);
        const results: number[] = [];

        const mapped = stream.pipe(map(n => n * 2));

        mapped.on("data", d => {
            results.push(d);
        });

        mapped.on("finish", () => {
            expect(results).toEqual(expected);
            done();
        });
    });
    it("should handle a large amount of objects", done => {
        expect.assertions(1);
        const stream = createReadStream(1e6);

        const expected = Array.from(Array(1e6), (_, i) => i * 2);
        const results: number[] = [];

        const mapped = stream.pipe(map(n => n * 2));

        mapped.on("data", d => {
            results.push(d);
        });

        mapped.on("finish", () => {
            expect(results).toEqual(expected);
            done();
        });
    });
});
