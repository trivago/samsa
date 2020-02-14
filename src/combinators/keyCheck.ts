import levelup from "levelup";
import rocksdb from "rocksdb";
import { Key } from "../_types";

const [primary, foreign] = process.argv.slice(-2);

const primaryDb = levelup(rocksdb(primary), { readOnly: true });
const foreignDb = levelup(rocksdb(foreign), { readOnly: true });

async function checkKeys(keys: Key[]) {
    for (const key of keys) {
        try {
            const [p, f] = await Promise.all([
                primaryDb.get(key),
                foreignDb.get(key)
            ]);

            if (p && f) {
                if (process.send) {
                    process.send({
                        key,
                        primary: p,
                        foreign: f
                    });
                } else {
                    throw new Error(
                        "You attempted to call `checkKeys` outside the context of a child process, where process.send doesn't exist"
                    );
                }
            }
        } catch (err) {
            if (err.notFound) {
                // see https://github.com/Level/level#dbgetkey-options-callback
                continue;
            } else {
                process.stderr.write(`${err.message}\n`);
                process.exit(1);
            }
        }
    }
    process.exit(0);
}

process.on("message", checkKeys);
