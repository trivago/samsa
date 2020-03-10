import { pipe } from "../pipe";
import { range } from "../../creators/range";
import { map, filter } from "../../operators";

describe("Utility: pipe", () => {
    it("should accept a readable and a transform", done => {
        const rangePipe = pipe(range(0, 10));

        const stream = rangePipe(map(n => n * 2));

        let actual: number[] = [];

        stream
            .on("data", data => {
                actual.push(data);
            })
            .on("end", () => {
                expect(actual).toEqual(Array.from(Array(11), (_, i) => i * 2));
                done();
            });
    });

    it("should accept multiple transforms", done => {
        const rangePipe = pipe(range(0, 10));

        const stream = rangePipe(filter(n => n % 2 === 0), map(n => n * 2));

        let actual: number[] = [];

        stream
            .on("data", data => {
                actual.push(data);
            })
            .on("end", () => {
                expect(actual).toEqual(
                    Array.from(Array(11), (_, i) => i)
                        .filter(i => i % 2 === 0)
                        .map(i => i * 2)
                );
                done();
            });
    });

    it("should allow pipes to be piped to other pipes", done => {
        const rangePipe = pipe(range(0, 10));

        const evenValues = rangePipe(filter(n => n % 2 === 0));

        const evensPipe = pipe(evenValues);

        let actual: number[] = [];

        evensPipe(map(n => n * 2))
            .on("data", data => {
                actual.push(data);
            })
            .on("end", () => {
                expect(actual).toEqual(
                    Array.from(Array(11), (_, i) => i)
                        .filter(i => i % 2 === 0)
                        .map(i => i * 2)
                );
                done();
            });
    });
});
