import { ObjectTransform } from "../ObjectTransform";
import { ObjectReadable } from "../ObjectReadable";

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

describe("Samsa-Utils", () => {
  describe("Util | ObjectWritable", () => {
    it("should be extendible", (done) => {
      class Mapper extends ObjectTransform<number, number> {
        _transform(data: number, encoding: string, next: Function) {
          this.push(data * 2);
          next();
        }
      }

      const actual: number[] = [];

      const counter = new Counter();

      counter
        .pipe(new Mapper())
        .on("data", (data) => actual.push(data))
        .on("end", () => {
          expect(actual).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
          done();
        });
    });
  });
});
