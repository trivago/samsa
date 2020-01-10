import { Readable, TransformCallback } from "stream";
import { ObjectReadable } from "../utils/ObjectReadable";
import { ObjectTransform } from "../utils/ObjectTransform";

export const switchMap = (project: (t: any) => Readable) => {
    let streamRegister: Readable[];

    const out = new ObjectTransform({
        transform(data, _: any, next: TransformCallback) {
            const reader = project(data);

            streamRegister.push(reader);

            reader.on("data", innerData => {
                this.push(innerData);
            });

            reader.on("end", () => {
                streamRegister = streamRegister.filter(i => i !== reader);
            });

            reader.on("error", err => {
                this.emit("error", err);
            });

            return next();
        }
    });

    return out;
};
