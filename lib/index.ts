import { tap, map } from "./operators";
import { Readable, Transform } from "stream";
import { createConsumerStream } from "./kafka/createConsumerStream";

(async () => {
    const consumer = await createConsumerStream(
        {
            brokers: [`${process.env.HOST_IP}:9092`]
        },
        {
            topic: "requests",
            fromBeginning: true,
            groupId: Date.now().toString()
            // autoResume: false
        }
    );
    let count = 0;
    consumer
        .pipe(map(({ key }) => key.toString()))
        .pipe(map(key => key + "\n"))
        // .on("data", () => {
        //     console.log("getting data");
        // });
        .pipe(
            tap(() => {
                count++;
            })
        )
        .on("data", () => {});

    setTimeout(() => {
        console.log(count);
        process.exit(0);
    }, 30000);
})();

// async function* count() {
//     for (let i = 0; i < 1e7; i++) {
//         yield i;
//     }
// }
