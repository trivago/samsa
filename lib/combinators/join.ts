import leveldown from "leveldown";
import levelup, { LevelUp } from "levelup";
import { Readable, Transform } from "stream";
import { sink } from "../operators";
import { merge } from "./merge";
import * as fs from "fs";
import * as path from "path";

export interface JoinConfig {
    cachePath?: string;
    cacheNames?: {
        primary: string;
        foreign: string;
    };
    caches?: {
        primary: LevelUp;
        foreign: LevelUp;
    };
}

export const join = (
    primary: Readable,
    foreign: Readable,
    config: JoinConfig = {}
) => {
    const {
        cachePath = ".cache",
        cacheNames = {
            primary: "primary",
            foreign: "foreign"
        },
        caches: providedCaches
    } = config;
    let caches: {
        primary: LevelUp;
        foreign: LevelUp;
    };

    if (providedCaches) {
        caches = providedCaches;
    } else {
        if (!fs.existsSync(path.join(cachePath))) {
            fs.mkdirSync(path.join(cachePath));
        }

        const primaryPath = path.join(cachePath, cacheNames.primary);
        const foreignPath = path.join(cachePath, cacheNames.foreign);

        caches = {
            primary: levelup(leveldown(primaryPath)),
            foreign: levelup(leveldown(foreignPath))
        };
    }

    const output = new Transform({
        objectMode: true,
        transform: async (key, _, next) => {
            try {
                const [pValue, fValue] = await Promise.all([
                    caches.primary.get(key),
                    caches.foreign.get(key)
                ]);

                // do we need to do this?
                // await Promise.all([
                //     primaryCache.del(key),
                //     foreignCache.del(key)
                // ]);

                next(null, {
                    key,
                    primary: pValue,
                    foreign: fValue
                });
            } catch (err) {
                if (err.type === "NotFoundError") {
                    next();
                } else {
                    next(err);
                }
            }
        }
    });

    merge(
        primary.pipe(sink(caches.primary)),
        foreign.pipe(sink(caches.foreign))
    ).pipe(output);

    return output;
};
