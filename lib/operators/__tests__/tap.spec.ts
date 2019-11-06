import { tap } from "../tap";
import { createReadStream } from "./stream.setup";

describe("Operator: tap", () => {
    const stream = createReadStream();

    it("should cause a sideeffect", done => {
        expect.assertions(1);
        let sideEffect = false;

        const tapped = stream.pipe(
            tap(() => {
                sideEffect = true;
            })
        );

        tapped.once("data", d => {
            expect(sideEffect).toBe(true);
            done();
        });
    });
});
