# Kafka Streams

Samsa exports a function<!-- s --> for handling creation of a topic consumer <!-- and producer --> from a kafka stream topic. Right now, this is powered by KafkaJS.

## createConsumerStream

Creates a stream of messages from a given Kafka topic.

| argument            | description                                                                    |
| ------------------- | ------------------------------------------------------------------------------ |
| kafkaClientOrConfig | a KafakJS client or KafkaJS client config                                      |
| streamConfig        | The configuration for the stream, extending the KafkaJS Consumer configuration |

A full list of client configuration options can be found in the [KafkaJS client configuration documentation](https://kafka.js.org/docs/configuration).

### Stream configuration options

| option        | required | default   | description                                                                                                           |
| ------------- | -------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| groupId       | yes      | undefined | the groupId to use for the underlying kafkaJS consumer                                                                |
| topic         | yes      | undefined | the topic to subscribe to                                                                                             |
| fromBeginning | no       | true      | whether or not to start consuming from the beginning of the topic                                                     |
| highWaterMark | no       | 20k       | the maximum number of messages that can be consumed at once, more messages than this will cause the consumer to pause |
| autoResume    | no       | true      | whether or not to automatically resume once a set interval has passed                                                 |
| resumeAfter   | no       | 1000      | the time, in ms, to wait before resuming consuming messages                                                           |

Checkout the [KafkaJS documentation](https://kafka.js.org/docs/consuming#a-name-options-a-options) for a full list of consumer options.

The expected output will be a stream of key value pairs of the form

```
{
    key: string | Buffer
    value: any
}
```

### Usage

```js
const messageStream = createConsumerStream(
    {
        brokers: ["localhost:9092"]
    },
    {
        groupId: Date.now().toString(),
        topic: "messages",
        fromBeginning: false
    }
);

// the stream can then be used like any other stream
messageStream.on("data", message => {
    console.log(message.key.toString('utf8));
    console.log(message.value);
});
```
