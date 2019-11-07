import leveldown from "leveldown";
import levelup, { LevelUp } from "levelup";
import { Readable, Transform } from "stream";
import { sink, SinkConfig } from "../operators";
import { merge } from "./merge";
import * as fs from "fs";
import * as path from "path";

export interface JoinConfig extends SinkConfig {
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

/**
 * Joins two streams of key-value pairs into a single stream containing both pieces of information
 * @param primary Readable stream containing primary information as key value pairs
 * @param foreign Readable stream contianing forieng information as key value pairs
 * @param joinConfig configuration for the caches used to join streams
 * TODO: Choose a default type of store. Right now we're using LevelDB, but could this just be switched to an in memory store by default?
 */
export const join = (
    primary: Readable,
    foreign: Readable,
    joinConfig: JoinConfig = {}
) => {
    const {
        cachePath = ".cache",
        cacheNames = {
            primary: "primary",
            foreign: "foreign"
        },
        caches: providedCaches,
        ...sinkConfig
    } = joinConfig;
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
            Promise.all([caches.primary.get(key), caches.foreign.get(key)])
                .then(([pValue, fValue]) => {
                    next(null, {
                        key,
                        [cacheNames.primary]: pValue,
                        [cacheNames.foreign]: fValue
                    });
                })
                .catch(err => {
                    if (err.type === "NotFoundError") {
                        return next();
                    } else {
                        return next(err);
                    }
                });
        }
    });

    merge(
        primary.pipe(sink(caches.primary, sinkConfig)),
        foreign.pipe(sink(caches.foreign, sinkConfig))
    ).pipe(output);

    return output;
};
