import { bufferCount } from "../bufferCount";
import { range } from "../../creators";

describe("Operator: bufferCount", () => {
    it("should buffer the correct count", done => {
        const r = range(0, 9);

        r.pipe(bufferCount(5)).once("data", data => {
            expect(Array.isArray(data)).toEqual(true);
            expect(data.length).toEqual(5);
            done();
        });
    });

    it("should empty it's buffer on end", done => {
        const r = range(0, 9);

        const actualOutput: number[][] = [];

        r.pipe(bufferCount(6))
            .on("data", data => {
                actualOutput.push(data);
            })
            .on("end", () => {
                expect(actualOutput.length).toEqual(2);
                expect(actualOutput[1].length).toEqual(4);
                done();
            });
    });
});
