import { createReadStream } from "./stream.setup";
import { join } from "../join";

describe("Combinator: join", () => {
    const _expected = Array.from(Array(9), (_, i) => ({
        key: i + 1,
        primary: Buffer.from((i + 1).toString()),
        foreign: Buffer.from((i + 1).toString())
    }));
    it("should merge 2 streams by key", done => {
        const stream1 = createReadStream(true);
        const stream2 = createReadStream(true);
        expect.assertions(1);
        const result: { key: any; primary: any; foreign: any }[] = [];

        const joined = join(stream1, stream2);

        joined.on("data", d => {
            result.push(d);
        });

        joined.on("finish", () => {
            expect(result).toEqual(_expected);
            done();
        });
    });
});
