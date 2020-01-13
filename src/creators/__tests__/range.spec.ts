import { range } from "../range";

describe("Creator: range", () => {
    it("should start at min", done => {
        expect.assertions(1);
        const r = range(0, 1);

        r.once("data", data => {
            expect(data).toEqual(0);
            done();
        });
    });

    it("should iterate from min to max", done => {
        expect.assertions(1);
        const r = range(0, 1);

        const actualOutput: number[] = [];

        r.on("data", data => {
            actualOutput.push(data);
        });

        r.on("end", () => {
            expect(actualOutput).toEqual([0, 1]);
            done();
        });
    });

    it("should accept a large range", done => {
        expect.assertions(1);
        const r = range(0, 1e6);

        const actualOutput: number[] = [];

        r.on("data", data => {
            actualOutput.push(data);
        });

        r.on("end", () => {
            expect(actualOutput.length).toEqual(1e6 + 1);
            done();
        });
    });
});
