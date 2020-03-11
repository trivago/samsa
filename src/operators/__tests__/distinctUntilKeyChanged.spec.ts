import { distinctUntilKeyChanged } from "./../distinctUntilKeyChanged";
import { from } from "../../creators";

describe("Operator: distinctUntilKeyChanged", () => {
    it("should accept a key", done => {
        const s = from([
            {
                foo: "bar"
            },
            {
                foo: "bar"
            },
            {
                foo: "baz"
            }
        ]);

        let actualOutput: any[] = [];

        s.pipe(distinctUntilKeyChanged("foo"))
            .on("data", data => {
                actualOutput.push(data);
            })
            .on("end", () => {
                expect(actualOutput).toEqual([
                    {
                        foo: "bar"
                    },
                    {
                        foo: "baz"
                    }
                ]);
                done();
            });
    });

    it("should accept a key and comparator", done => {
        const s = from([
            {
                foo: {
                    bar: 1
                }
            },
            {
                foo: {
                    bar: 1
                }
            },
            {
                foo: {
                    bar: 2
                }
            }
        ]);

        let actualOutput: any[] = [];

        s.pipe(
            distinctUntilKeyChanged(
                "foo",
                (prev, curr) => prev.bar !== curr.bar
            )
        )
            .on("data", data => {
                actualOutput.push(data);
            })
            .on("end", () => {
                expect(actualOutput).toEqual([
                    {
                        foo: {
                            bar: 1
                        }
                    },
                    {
                        foo: {
                            bar: 2
                        }
                    }
                ]);
                done();
            });
    });

    it("should only output once if the key doesn't exist", done => {
        const s = from([
            {
                foo: "bar"
            },
            {
                foo: "bar"
            },
            {
                foo: "baz"
            }
        ]);

        let actualOutput: any[] = [];

        s.pipe(distinctUntilKeyChanged("bar"))
            .on("data", data => {
                actualOutput.push(data);
            })
            .on("end", () => {
                expect(actualOutput).toEqual([
                    {
                        foo: "bar"
                    }
                ]);
                done();
            });
    });
});
