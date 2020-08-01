const EventEmitter = require("events");
const debug = require("debug")("mqtttokafka:bridge");
//const KafkaClient = require("./kafka/KafkaClient.js");
const StompClient = require("./client_modules/stomp/stompClient");
const HttpServer = require("./HttpServer.js");

class Bridge extends EventEmitter {
  constructor(config = {}) {
    super();

    // if (!config.kafka) {
    //   throw new Error("Kafka configuration missing.");
    // }

    if (!config.stomp) {
      throw new Error("Stomp configuration missing.");
    }

    // if (!config.routing) {
    //   throw new Error("Routing configuration missing.");
    // }

    debug("Routing configuration", config.routing);

    this.config = config;
    this.topicDelimiter = config.kafkaTopicDelimiter || "-";
    this.routedMessages = 0;
    this.skippedMessages = 0;
    this.errors = 0;
    this.startedAt = new Date().toISOString();

    this.on("error", (error) => {
      this.errors++;
    });

    this.stompClient = new StompClient(config.stomp, config.subscribeEtl);

    this.stompClient.on("error", (error) => {
      this.emit("error", error);
    });

    this.stompClient.on("message", (topic, message) => {
      if (this.config.logMessages) {
        debug("routing for topic", topic, message);
      }

      this._route(topic, message, this.config.routing);
    });

    this.stompClient.on("connected", () => {
      debug("Subscribing messages");
      this.stompClient.subscribeMessages();
    });

    // this.kafkaClient = new KafkaClient(config.kafka, config.produceEtl);

    // this.kafkaClient.on("error", (error) => {
    //   this.emit("error", error);
    // });

    this.httpServer = new HttpServer(config.http || { port: 3967 }, this);
  }

  getStats() {
    return {
      startedAt: this.startedAt,
      bridge: {
        skippedMessages: this.skippedMessages,
        routedMessages: this.routedMessages,
        errorCount: this.errors,
      },
      stomp: this.stompClient.getStats(),
      kafka: this.kafkaClient.getStats(),
    };
  }

  close() {
    debug("Closing..");

    if (this.httpServer) {
      this.httpServer.close();
    }

    if (this.stompClient) {
      this.stompClient.close();
    }

    if (this.kafkaClient) {
      this.kafkaClient.close();
    }
  }

  _route(topic, message, routing) {
    // we try to use specific topic routings first
    let target = routing[topic];

    // otherwise check if there is a wildcard configured
    if (!target) {
      target = routing[WILDCARD];
    }

    // stomp topic not configured and wildcard not present, we drop this message
    if (!target) {
      this.skippedMessages++;
      return;
    }

    this.routedMessages++;

    // // if target for this topic is a wildcard, we have to convert the stomp topic name to a kafka topic
    // if (target === WILDCARD) {
    //   const kafkaTopicName = topic.replace(
    //     stomp_TOPIC_PATTERN,
    //     this.topicDelimiter
    //   );
    //   return this.kafkaClient
    //     .produce(kafkaTopicName, message)
    //     .catch((error) => {
    //       this.emit("error", error);
    //     });
    // }

    // // if target is not a wildcard, target is the topic name to produce this message to
    // return this.kafkaClient.produce(target, message).catch((error) => {
    //   this.emit("error", error);
    // });
  }

  async run() {
    debug("Starting..");
    // await this.kafkaClient.connect();
    await this.stompClient.connect();
    // this.stompClient.subscribeMessages();
    await this.httpServer.run();
    // debug("Started.");
  }
}

module.exports = Bridge;
