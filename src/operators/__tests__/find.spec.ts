import { find } from "../find";
import { range } from "../../creators";

describe("Operator: find", () => {
    it("should find a value that passes the predicate", done => {
        const r = range(0, 9);

        let value: number = 0;

        r.pipe(find(n => n === 3))
            .on("data", data => {
                value = data;
            })
            .on("end", () => {
                expect(value).toEqual(3);
                done();
            });
    });

    it("shouldn't output a value if no value passes the predicate", done => {
        const r = range(0, 9);

        let value: number = 0;

        r.pipe(find(n => n === 10))
            .on("data", data => {
                value = data;
            })
            .on("end", () => {
                expect(value).toEqual(0);
                done();
            });
    });

    it("should unpipe the input if a value passes the predicate", done => {
        const r = range(0, 9);

        let value: number = 0;

        let unpiped = false;

        r.pipe(find(n => n === 2))
            .on("data", data => {
                value = data;
            })
            .on("unpipe", () => {
                unpiped = true;
            })
            .on("end", () => {
                expect(value).toEqual(2);
                expect(unpiped).toEqual(true);
                done();
            });
    });
});
