import { ObjectReadable } from "../ObjectReadable";

describe("Samsa-Utils", () => {
  describe("Util | ObjectReadable", () => {
    it("should be extendible", (done) => {
      class Counter extends ObjectReadable<number> {
        count: number = 0;

        _read() {
          if (this.count < 10) {
            this.push(this.count);
          } else {
            this.push(null);
          }

          this.count++;
        }
      }

      const counter = new Counter();

      const actual: number[] = [];

      counter.on("data", (data) => {
        actual.push(data);
      });

      counter.on("end", () => {
        expect(actual).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        done();
      });
    });
  });
});
