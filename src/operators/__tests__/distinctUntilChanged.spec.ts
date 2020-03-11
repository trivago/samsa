import { distinctUntilChanged } from "./../distinctUntilChanged";
import { from } from "../../creators";

describe("Operator: distinctUntilChanged", () => {
    it("should only output values if the value changes", done => {
        const s = from([1, 1, 2]);

        let actualOutput: number[] = [];

        s.pipe(distinctUntilChanged())
            .on("data", data => {
                actualOutput.push(data);
            })
            .on("end", () => {
                expect(actualOutput).toEqual([1, 2]);
                done();
            });
    });

    it("should accept a comparator function", done => {
        const s = from([{ foo: "bar" }, { foo: "bar" }, { foo: "baz" }]);

        let actualOutput: any[] = [];

        s.pipe(distinctUntilChanged((prev, curr) => prev.foo !== curr.foo))
            .on("data", data => {
                actualOutput.push(data);
            })
            .on("end", () => {
                expect(actualOutput).toEqual([{ foo: "bar" }, { foo: "baz" }]);
                done();
            });
    });
});
