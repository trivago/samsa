import { Writable, WritableOptions } from "stream";

export abstract class ObjectWritable<In> extends Writable {
  constructor(opts: WritableOptions = {}) {
    super({
      ...opts,
      objectMode: true,
    });
  }

  abstract _write(data: In, encoding: string, callback: Function): void;
}
