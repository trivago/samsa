// import levelup from "levelup";
// import rocksdb from "rocksdb";
// import { Key } from "../_types";

// // (async function main() {
// const [primary, foreign] = process.argv.slice(-2);

// const primaryDb = levelup(rocksdb(primary), { readOnly: true });
// const foreignDb = levelup(rocksdb(foreign), { readOnly: true });

// process.on("message", async (keys: Key[]) => {
//     for (const key of keys) {
//         try {
//             const [p, f] = await Promise.all([
//                 primaryDb.get(key),
//                 foreignDb.get(key)
//             ]);

//             if (p && f) {
//                 if (process.send) {
//                     process.send({
//                         key,
//                         primary: p,
//                         foreign: f
//                     });
//                 } else {
//                     throw new Error("process.send is undefined");
//                 }
//             }
//         } catch (err) {
//             if (!err.notFound) {
//                 process.stderr.write(err.message);
//                 process.exit(1);
//             }
//         }
//     }
//     process.exit(0);
// });
// // })();