import { createReadStream } from "./stream.setup";
import { filter, FilterPredicate } from "../filter";

describe("Operator: filter", () => {
    it("should filter based on a predicate", done => {
        const stream = createReadStream();
        expect.assertions(1);
        const predicate: FilterPredicate<number> = n => n % 2 === 0;

        let result: number[] = [];

        const filtered = stream.pipe(filter(predicate));

        filtered.on("data", d => result.push(d));

        filtered.on("finish", () => {
            expect(result).toEqual([0, 2, 4, 6, 8]);
            done();
        });
    });
    it("should handle more than 16 objects", done => {
        const stream = createReadStream(17);
        expect.assertions(1);

        const predicate: FilterPredicate<number> = n => n % 2 === 0;
        const expected = Array.from(Array(17), (_, i) => i).filter(
            n => n % 2 === 0
        );

        let result: number[] = [];

        const filtered = stream.pipe(filter(predicate));

        filtered.on("data", d => result.push(d));

        filtered.on("finish", () => {
            expect(result).toEqual(expected);
            done();
        });
    });
    it("should handle a large amount of objects", done => {
        const stream = createReadStream(1e6);
        expect.assertions(1);

        const predicate: FilterPredicate<number> = n => n % 2 === 0;
        const expected = Array.from(Array(1e6), (_, i) => i).filter(
            n => n % 2 === 0
        );

        let result: number[] = [];

        const filtered = stream.pipe(filter(predicate));

        filtered.on("data", d => result.push(d));

        filtered.on("finish", () => {
            expect(result).toEqual(expected);
            done();
        });
    });
});
