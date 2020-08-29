# stomp-kafka-bridge
Bridge to connect stomp client to kafka.

## Intro

`stomp-to-kafka-bridge` allows you to quickly create a bridge that subscribes to Stomp messages and produces them to your Apache Kafka cluster.

You can configure **routing** (move messages from Stomp Destination to certain Kafka topics).

The configuration allows multiple destinations to be mapped to various Kafka Topics.

The whole configuration is JSON based, with easy  parameters which makes it very flexible to use.

The bridge spins up an http server, which can be used to check its health status `http://localhost:3967/healthcheck` as well as statistics `http://localhost:3967/stats`.

## How to use?
```
const Bridge = require("stomp-to-kafka-bridge");
let config = require("./config.js");
const bridge = new Bridge(config);
//Catching error and closing the bridge
bridge.on("error", (err) => {
  console.log(err);
  bridge.close();
});

bridge.run().catch(console.error);
```

## SAMPLE CONFIG

The below code is required in config.js

```
module.exports = {
  // stomp connection options
  stomp: {
    user: "username",
    password: "pass",
    port: "61618",
    address: "stomp.address",
    topics: ["T1", "T2", "T3"],
    url: null,
    isSaveInLocal: false,
  },
  routing: {
    T1: "KAFKA_TOPIC_1",
    T2: "KAFKA_TOPIC_2",
    T3: "KAFKA_TOPIC_3",
  },
  kafka: {
    clientId: "my-app",
    brokers: ["localhost:9092"],
  },
  http:3981,
  logMessages: false,
};
```




