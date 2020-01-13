import { from } from "../from";

describe("Creator: from", () => {
    it("should accept a promise", done => {
        expect.assertions(2);
        const input = new Promise(res => res("resolved"));

        const fromPromise = from(input);

        fromPromise.on("data", data => {
            expect(data).toEqual("resolved");
        });
        fromPromise.on("end", () => {
            expect(1).toEqual(1);
            done();
        });
    });

    it("should accept an array", done => {
        expect.assertions(1);
        const expectedOutput = [1, 2, 3, 4, 5];

        const fromArray = from([1, 2, 3, 4, 5]);

        const actualOutput: number[] = [];

        fromArray.on("data", data => {
            actualOutput.push(data);
        });

        fromArray.on("end", () => {
            expect(actualOutput).toEqual(expectedOutput);
            done();
        });
    });

    it("should accept an iterable", done => {
        expect.assertions(1);

        const input = "this is a test";

        const fromIterable = from(input);

        const actualOutput: string[] = [];

        fromIterable.on("data", data => {
            actualOutput.push(data);
        });

        fromIterable.on("end", () => {
            expect(actualOutput).toEqual(input.split(""));
            done();
        });
    });

    it("should accept a generator", done => {
        expect.assertions(1);

        const input = function*() {
            let count = 0;
            while (count++ < 10) {
                yield count;
            }
        };

        const fromGenerator = from(input());

        const actualOutput: number[] = [];

        fromGenerator.on("data", data => {
            actualOutput.push(data);
        });

        fromGenerator.on("end", () => {
            expect(actualOutput).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            done();
        });
    });
});
