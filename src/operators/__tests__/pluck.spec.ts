import { pluck } from "../pluck";
import { of } from "../../creators/of";

describe("Operator: pluck", () => {
    it("should return the given field", done => {
        const stream = of({
            name: "name"
        });

        stream.pipe(pluck("name")).once("data", data => {
            expect(data).toEqual("name");
            done();
        });
    });

    it("should return nested fields", done => {
        const stream = of({
            foo: {
                bar: "baz"
            }
        });

        stream.pipe(pluck("foo", "bar")).once("data", data => {
            expect(data).toEqual("baz");
            done();
        });
    });

    it("should accept indexes", done => {
        const stream = of({
            foo: {
                bar: ["baz"]
            }
        });

        stream.pipe(pluck("foo", "bar", 0)).once("data", data => {
            expect(data).toEqual("baz");
            done();
        });
    });

    it("should return undefined for undefined properties", done => {
        const stream = of({});

        stream.pipe(pluck("foo")).once("data", data => {
            expect(data).toBeUndefined();
            done();
        });
    });

    it("null shouldn't kill the stream", done => {
        const stream = of({
            foo: null
        });

        let count = 0;

        stream
            .pipe(pluck("foo"))
            .on("data", () => {
                count++;
            })
            .on("end", () => {
                expect(count).toEqual(0);
                done();
            });
    });
});
