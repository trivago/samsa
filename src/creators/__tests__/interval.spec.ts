import { interval } from "../interval";

describe("Creator: interval", () => {
    it("should start at 0", done => {
        expect.assertions(1);
        const i = interval(100);

        i.once("data", data => {
            expect(data).toEqual(0);
            done();
        });
    });

    // this takes into account that nothing will emit in the first 100ms
    it("should output 9 times in 1 second, with an interval of 100ms", done => {
        expect.assertions(1);
        const i = interval(100);

        const actualOutput: number[] = [];

        i.on("data", data => {
            actualOutput.push(data);
        });

        setTimeout(() => {
            expect(actualOutput.length).toEqual(9);
            done();
        }, 1001);
    });
});
