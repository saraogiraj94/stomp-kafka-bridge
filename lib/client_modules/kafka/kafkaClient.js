const { Kafka } = require("kafkajs");
const EventEmitter = require("events");
const debug = require("debug")("stomptokafka:kafka");

class KafkaClient extends EventEmitter {
  constructor(config = {}, etl = null) {
    super();

    this._config = config;
    this.etl = etl;
    this.producer = null;
    this._producedMessages = 0;
  }

  async connect() {
    debug("Connecting...");
    const kafka = new Kafka(this._config);
    this.producer = kafka.producer();
    await this.producer.connect();
    debug("Connected.");
  }

  produce(_topic, _messages) {
    const messages = JSON.parse(_messages).map((message) => {
      return { value: JSON.stringify(message) };
    });
    debug("Producing messages...");
    return this.producer.send({
      topic: _topic,
      messages,
    });
  }

  async close() {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }

  getStats() {}
}

module.exports = KafkaClient;
