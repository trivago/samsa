import { Transform, TransformOptions } from "stream";
import { ObjectWritable } from "./ObjectWritable";
import { ObjectDuplex } from "./ObjectDuplex";

export abstract class ObjectTransform<In, Out> extends Transform {
  constructor(opts: TransformOptions = {}) {
    super({
      ...opts,
      objectMode: true,
    });
  }

  push(chunk: Out | null, encoding?: string): boolean {
    return super.push(chunk, encoding);
  }

  pipe<NextDuplexOut>(
    destination: ObjectDuplex<Out, NextDuplexOut>,
    options?: { end?: boolean }
  ): ObjectDuplex<Out, NextDuplexOut>;
  pipe<NextTransformOut>(
    destination: ObjectTransform<Out, NextTransformOut>,
    options?: { end?: boolean }
  ): ObjectTransform<Out, NextTransformOut>;
  pipe(
    destination: ObjectWritable<Out>,
    options?: { end?: boolean }
  ): ObjectWritable<Out>;
  pipe<T>(
    destination: NodeJS.WritableStream,
    options?: { end?: boolean }
  ): NodeJS.WritableStream {
    return super.pipe(destination, options);
  }
}
