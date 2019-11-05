import { createReadStream } from "./stream.setup";
import { join } from "../join";

describe("Combinator: join", () => {
    const stream1 = createReadStream(true);
    const stream2 = createReadStream(true);

    const _expected = Array.from(Array(10), (_, i) => ({
        key: i,
        primary: i,
        foreign: i
    }));
    it("should merge 2 streams by key", () => {
        const result: { key: any; primary: any; foreign: any }[] = [];

        const joined = join(stream1, stream2);

        joined.on("data", d => {
            result.push(d);
        });

        joined.on("close", () => {
            expect(result).toEqual(_expected);
        });
    });
});
