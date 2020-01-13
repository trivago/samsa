import { ObjectReadable } from "../utils/ObjectReadable";
export const range = (min: number, max: number) => {
    let counter = min;

    return new ObjectReadable({
        read() {
            this.push(counter);
            counter++;
            if (counter > max) {
                this.push(null);
            }
        }
    });
};
