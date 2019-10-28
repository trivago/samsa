import { createReadStream } from "./stream.setup";
import { MapCallback, map } from "../map";

describe("Operator: map", () => {
    const stream = createReadStream();
    it("should map values to a new value", () => {
        const result: number[] = [];

        const mapper: MapCallback<number, number> = n => n * 2;

        stream.pipe(map(mapper));

        stream.on("data", result.push);

        stream.on("close", () => {
            expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
        });
    });
});
