import { createReadStream } from "./stream.setup";
import { MapCallback, map } from "../map";

describe("Operator: map", () => {
    const stream = createReadStream();
    it("should map values to a new value", done => {
        expect.assertions(1);
        const result: number[] = [];

        const mapper: MapCallback<number, number> = n => n * 2;

        const mapped = stream.pipe(map(mapper));

        mapped.on("data", d => {
            result.push(d);
        });

        mapped.on("finish", () => {
            expect(result).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18]);
            done();
        });
    });
});
