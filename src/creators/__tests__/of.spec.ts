import { of } from "../of";

describe("Creator: of", () => {
    it("should accept a value", done => {
        expect.assertions(2);
        const ofAnything = of("test");

        ofAnything.on("data", data => {
            expect(data).toEqual("test");
        });
        ofAnything.on("end", () => {
            expect(1).toEqual(1);
            done();
        });
    });

    it("should accept multiple values", done => {
        expect.assertions(1);
        const ofAnything = of(1, 2, 3, 4);

        const actualOutput: number[] = [];

        ofAnything.on("data", data => {
            actualOutput.push(data);
        });

        ofAnything.on("end", () => {
            expect(actualOutput).toEqual([1, 2, 3, 4]);
            done();
        });
    });

    it("should accept an array, but not iterate over it", done => {
        expect.assertions(2);

        const ofArray = of([1, 2, 3, 4]);

        ofArray.on("data", data => {
            expect(data).toEqual([1, 2, 3, 4]);
        });
        ofArray.on("end", () => {
            expect(1).toEqual(1);
            done();
        });
    });
});
