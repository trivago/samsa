import { createReadStream } from "./stream.setup";
import { skipFirst } from "../skipFirst";

describe("Operator: skipFirst", () => {
    const stream = createReadStream();
    it("should skip the first", () => {
        const results: number[] = [];
        stream.pipe(skipFirst());

        stream.on("data", results.push);

        stream.on("close", () => {
            expect(results).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });
    });
});
