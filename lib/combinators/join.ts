import { ObjectTransform } from "./../utils/ObjectTransform";

import { TransformOptions, TransformCallback, Readable } from "stream";
import { Key, KeyValuePair } from "../_types";
import { KTable } from "./../kafka/KTable";
import { tap } from "../operators";
import { merge } from ".";

// /**
//  * 2 ktables
//  * kstream + ktable
//  *
//  * kstream - stateless
//  * ktable - changelog table for a stream (what we have in leveldb, technically)
//  *
//  * windowed joins
//  *  give a windowed view
//  */

type JoinProjection<P extends any, F extends any, R extends any> = (
    p: P,
    f: F
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

export const innerJoin = <P extends any, F extends any, R extends any>(
    primaryStream: Readable,
    foreignStream: Readable,
    project: JoinProjection<P, F, any> = defaultProjection,
    window: number = 10
) => {
    const primaryKeyMap: KeyMap = new Map();
    const foreignKeyMap: KeyMap = new Map();

    const primaryTable = new KTable();
    const foreignTable = new KTable();

    const seenBoth = (key: Key) =>
        primaryKeyMap.has(key.toString()) && foreignKeyMap.has(key.toString());

    const cleanupLoop = startCleanupLoop(
        window * 1000,
        primaryKeyMap,
        foreignKeyMap
    );

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

                    this.push(project(pValue, fValue));
                }

                next();
            } catch (err) {
                next(err);
            }
        },
        final(next) {
            clearInterval(cleanupLoop);
            next();
        },
        flush(next) {
            clearInterval(cleanupLoop);
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
export const join = innerJoin;
