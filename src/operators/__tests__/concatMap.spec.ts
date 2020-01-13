import { concatMap } from "../concatMap";
import { createReadStream } from "./stream.setup";

describe("Operator: concatMap", () => {
    it("should concat multiple streams", done => {
        expect.assertions(1);

        const stream = createReadStream(2);

        const concattedStreams = stream.pipe(
            concatMap(n => {
                return createReadStream(5);
            })
        );

        const actualOutput: number[] = [];

        concattedStreams.on("data", data => {
            actualOutput.push(data);
        });

        concattedStreams.on("end", () => {
            expect(actualOutput).toEqual([0, 1, 2, 3, 4, 0, 1, 2, 3, 4]);
            done();
        });
    });

    it("should concat a lot of streams", done => {
        expect.assertions(1);

        const stream = createReadStream(100);

        const concattedStreams = stream.pipe(
            concatMap(n => createReadStream(5))
        );

        const actualOutput: number[] = [];

        concattedStreams.on("data", data => {
            actualOutput.push(data);
        });

        concattedStreams.on("end", () => {
            expect(actualOutput).toEqual(
                Array.from(Array(100), () => [0, 1, 2, 3, 4]).reduce(
                    (acc, val) => acc.concat(val),
                    []
                )
            );
            done();
        });
    });
});
