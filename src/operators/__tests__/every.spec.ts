import { every } from "../every";
import { range } from "../../creators/range";

describe("Operator: every", () => {
    it("should emit true if all values pass the predicate", done => {
        const r = range(0, 9);

        r.pipe(every(n => n < 10)).once("data", data => {
            expect(data).toEqual(true);
            done();
        });
    });

    it("should only emit true once", done => {
        let callCount = 0;

        const r = range(0, 9);

        r.pipe(every(n => n < 10))
            .on("data", data => {
                callCount++;
                expect(data).toEqual(true);
            })
            .on("end", () => {
                expect(callCount).toEqual(1);
                done();
            });
    });

    it("should emit false if a single value doesn't pass the predicate", done => {
        const r = range(0, 9);

        r.pipe(every(n => n === 10)).once("data", data => {
            expect(data).toEqual(false);
            done();
        });
    });

    it("should only emit false once if a single value doesn't pass the predicate", done => {
        let callCount = 0;

        const r = range(0, 9);

        r.pipe(every(n => n !== 2))
            .on("data", data => {
                callCount++;
                expect(data).toEqual(false);
            })
            .on("end", () => {
                expect(callCount).toEqual(1);
                done();
            });
    });
});
