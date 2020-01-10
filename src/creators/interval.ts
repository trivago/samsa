import { ObjectReadable } from "../utils/ObjectReadable";

export const interval = (i: number) => {
    let counter = 0;

    return new ObjectReadable({
        read() {
            setTimeout(() => {
                this.push(counter);
                counter++;
            }, i);
        }
    });
};
