import { ObjectTransform } from "../utils/ObjectTransform";

import { TransformCallback, Readable } from "stream";
import { Key } from "../_types";
import { KTable } from "../kafka/KTable";
import { tap } from "../operators";
import { merge } from "./merge";

export interface KTableConfig {
    batchSize?: number;
    batchAge?: number;
}

export type JoinProjection<P extends any, F extends any, R extends any> = (
    primary: P,
    foreign: F
) => R;

type KeyMap = Map<Key, number>;

const defaultProjection: JoinProjection<
    any,
    any,
    { primary: any; foreign: any }
> = (primary, foreign) => ({ primary, foreign });

const storeKey = (store: KeyMap) =>
    tap((key: Key) => {
        store.set(key.toString(), Date.now());
    });

const startCleanupLoop = (timeWindow: number, ...maps: KeyMap[]) => {
    const now = Date.now();
    return setInterval(() => {
        for (const keyMap of maps) {
            for (const [key, timestamp] of keyMap) {
                const timeDiff = Math.abs(now - timestamp);

                if (timeDiff > timeWindow) {
                    keyMap.delete(key);
                }
            }
        }
    }, timeWindow);
};

/**
 * Represents and windowed inner join in a streaming context.
 *
 * @param primaryStream The primary stream to read from
 * @param foreignStream The foreign stream to read from
 * @param project a projection to be used when values from each stream are found
 * @param window how long to keep keys in memory
 * @param kTableConfig optional configuration for the underlying ktables that are used for joins
 */
export const innerJoin = <P extends any, F extends any, R extends any>(
    primaryStream: Readable,
    foreignStream: Readable,
    project: JoinProjection<P, F, any> = defaultProjection,
    window: number = 0,
    kTableConfig: KTableConfig = {}
) => {
    const { batchAge, batchSize } = kTableConfig;
    const primaryKeyMap: KeyMap = new Map();
    const foreignKeyMap: KeyMap = new Map();

    const primaryTable = new KTable(batchSize, batchAge);
    const foreignTable = new KTable(batchSize, batchAge);

    const seenBoth = (key: Key) =>
        primaryKeyMap.has(key.toString()) && foreignKeyMap.has(key.toString());

    let cleanupLoop: NodeJS.Timeout;

    if (window > 0) {
        cleanupLoop = startCleanupLoop(
            window * 1000,
            primaryKeyMap,
            foreignKeyMap
        );
    }

    const joinedOutput = new ObjectTransform({
        transform: async function innerJoinTransform(
            key: Key,
            _: any,
            next: TransformCallback
        ) {
            try {
                if (seenBoth(key)) {
                    // we should have both in our ktables
                    const [pValue, fValue] = await Promise.all([
                        primaryTable.get(key),
                        foreignTable.get(key)
                    ]);

                    this.push({
                        key,
                        value: project(pValue, fValue)
                    });
                }

                next();
            } catch (err) {
                next(err);
            }
        },
        final(next) {
            if (cleanupLoop) {
                clearInterval(cleanupLoop);
            }
            next();
        },
        flush(next) {
            if (cleanupLoop) {
                clearInterval(cleanupLoop);
            }
            next();
        }
    });

    const primaryKeyStream = primaryStream.pipe(primaryTable);
    const foreignKeyStream = foreignStream.pipe(foreignTable);

    merge(
        primaryKeyStream.pipe(storeKey(primaryKeyMap)),
        foreignKeyStream.pipe(storeKey(foreignKeyMap))
    ).pipe(joinedOutput);

    return joinedOutput;
};
/**
 * Alias to innerJoin
 */
export const join = innerJoin;
