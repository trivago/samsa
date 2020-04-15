import { ObjectWritable } from "../ObjectWritable";

describe("Samsa-Utils", () => {
  describe("Util | ObjectWritable", () => {
    it("should be extendible", (done) => {
      class Output extends ObjectWritable<string> {
        data: string = "";

        _write(data: string, encoding: string, next: Function) {
          this.data = data;
          next();
        }
      }

      const out = new Output();

      out.on("finish", () => {
        expect(out.data).toEqual("test");
        done();
      });

      out.write("test");
      out.end();
    });
  });
});
