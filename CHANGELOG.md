# Changelog

## master

-   Features
-   Bug Fixes

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
