# Changelog

## master

-   Features
-   Bug Fixes

## v0.3.1

- Features
    - Added meta information to messages being pushed from `createConsumerStream`:
        - topic
        - partition
        - offset
        - timestamp
        - size
        - attributes
        - headers

## v0.3.0

- Breaking Changes
    - move from LevelDB to RocksDB as the underlying store for joins
        - this change does not affect sinks however
- Features
    - Added a configurable buffer to the joiner
    - Added the ability to automatically disconnect a consumer group on process exit

## v0.2.4

- Rollback
    - Rollback v0.2.2 and v0.2.3, the memory fix didn't help strangely

## v0.2.3

- Bug Fixes
    - Fixed a bug where joined messages weren't being output

## v0.2.2

- Bug Fixes
    - Changed join from transform to duplex to try and combat memory usage issues

## v0.2.1

-   Bug Fixes
    -   fixed a bug where typings were not working as intended
    -   changed to export each individual function, instead of uisng the \* export

## v0.2.0

-   Features
    -   Operators
        -   Added some higher order mapping ability
            -   concatMap
            -   mergeMap / flatMap
            -   switchMap
    -   Creators
        -   Introduction of some stream creators
            -   from
            -   of
            -   interval
            -   range

## v0.1.0

-   Features
    -   Kafka
        -   Introduction of the ability to create a Kafka Streams consumer
            -   createConsumerStream
    -   Operators
        -   Introduction of the basic operators needed on a day to day basis
            -   map
            -   filter
            -   reduce
            -   scan
            -   sink
            -   skip
            -   skipFirst
            -   tap
    -   Combinators
        -   Introduction of some basic combinators
            -   merge
            -   join / innerJoin
