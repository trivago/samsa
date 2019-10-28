import { tap } from "../tap";
import { createReadStream } from "./stream.setup";

describe("Operator: tap", () => {
    const stream = createReadStream();

    it("should cause a sideeffect", () => {
        let sideEffect = false;

        stream.pipe(
            tap(() => {
                sideEffect = true;
            })
        );

        stream.on("close", () => {
            expect(sideEffect).toBe(true);
        });
    });
});
