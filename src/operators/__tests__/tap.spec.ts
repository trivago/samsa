import { Writable } from "stream";
import { tap } from "../tap";
import { createReadStream } from "./stream.setup";

describe("Operator: tap", () => {
    it("should cause a sideeffect", done => {
        const stream = createReadStream();

        expect.assertions(1);
        let sideEffect = false;

        const tapped = stream.pipe(
            tap(() => {
                sideEffect = true;
            })
        );

        tapped.once("data", d => {
            expect(sideEffect).toBe(true);
            done();
        });
    });

    /**
     * While testing the tap operator, it became clear that it was never properly clearing out its buffer
     * due to its internal high water mark and how I was passing values through
     */
    it("should handle more than 16 objects", done => {
        expect.assertions(1);
        const stream = createReadStream(17);

        const expected = Array.from(Array(17), (_, i) => i);
        const results: number[] = [];

        // needed because otherwise the stream won't emit for some reason.
        const blackhole = new Writable({
            objectMode: true,
            write(_, __, next) {
                next(null);
            }
        });
        const tapped = stream
            .pipe(
                tap(n => {
                    results.push(n);
                })
            )
            .pipe(blackhole);

        tapped.on("finish", () => {
            expect(results).toEqual(expected);
            done();
        });
    });
    it("should handle a large amount of objects", done => {
        expect.assertions(1);
        const stream = createReadStream(1e6);

        const expected = Array.from(Array(1e6), (_, i) => i);
        const results: number[] = [];

        // needed because otherwise the stream won't emit for some reason.
        const blackhole = new Writable({
            objectMode: true,
            write(_, __, next) {
                next(null);
            }
        });
        const tapped = stream
            .pipe(
                tap(n => {
                    results.push(n);
                })
            )
            .pipe(blackhole);

        tapped.on("finish", () => {
            expect(results).toEqual(expected);
            done();
        });
    });
});
