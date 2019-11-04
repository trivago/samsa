import leveldown from "leveldown";
import levelup from "levelup";
import { Readable, Transform } from "stream";
import { sink } from "../operators";
import { merge } from "./merge";

export interface CacheNames {
    primary?: string;
    foreign?: string;
}

export interface JoinConfig {
    cacheNames?: CacheNames;
}

export const join = (
    primary: Readable,
    foreign: Readable,
    config: JoinConfig
) => {
    const {
        cacheNames = {
            primary: "primary",
            foreign: "foreign"
        }
    } = config;

    const primaryCache = levelup(leveldown(`${cacheNames.primary}`));
    const foreignCache = levelup(leveldown(`${cacheNames.foreign}`));

    const output = new Transform({
        objectMode: true,
        transform: async (key, _, next) => {
            try {
                const [pValue, fValue] = await Promise.all([
                    primaryCache.get(key),
                    foreignCache.get(key)
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
        primary.pipe(sink(primaryCache)),
        foreign.pipe(sink(foreignCache))
    ).pipe(output);

    return output;
};
