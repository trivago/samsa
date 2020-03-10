import { ignoreElements } from "../ignoreElements";
import { of, range } from "../../creators";

describe("Operator: ignoreElements", () => {
    it("shouldn't output any data", done => {
        let callCount = 0;

        const stream = of("one");

        stream
            .pipe(ignoreElements())
            .on("data", () => {
                callCount++;
            })
            .on("end", () => {
                expect(callCount).toEqual(0);
                done();
            });
    });

    it("shouldn't output any data from a stream with multiple values", done => {
        let callCount = 0;
        const stream = range(0, 5);

        stream
            .pipe(ignoreElements())
            .on("data", () => {
                callCount++;
            })
            .on("end", () => {
                expect(callCount).toEqual(0);
                done();
            });
    });

    it("should handle a stream with more than 16 values", done => {
        let callCount = 0;
        const stream = range(0, 100);

        stream
            .pipe(ignoreElements())
            .on("data", () => {
                callCount++;
            })
            .on("end", () => {
                expect(callCount).toEqual(0);
                done();
            });
    });
});
