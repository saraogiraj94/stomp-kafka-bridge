"use strict";

const EventEmitter = require("events");
const debug = require("debug")("stomptokafka:stomp");
const uuid = require("uuid");
const stompClient = require("stomp-client").StompClient;

class StompClient extends EventEmitter {
  constructor(config = {}, etl = null) {
    super();

    this._config = config;
    this._etl = etl;
    this.client = null;
  }

  subscribeMessages() {
    const { topics } = this._config;
    topics.forEach((topic) => {
      debug("Subscribing to " + topic + "....");
      this.client.subscribe(`/destination/${topic}`, function (body, headers) {
        console.log(JSON.parse(body));
        this.emit("message", topic, body);
      });
    });
  }

  async connect() {
    debug("Connecting....");

    const { user, password, port, address, version = "1.0" } = this._config;
    const { topics } = this._config;
    this.client = new stompClient(address, port, user, password, version);
    var that = this;
    this.client.connect(function (sessionId) {
      debug("11 ", this);
      debug("Connected.....");
      topics.forEach((topic) => {
        debug("Subscribing to " + topic + "....");
        that.client.subscribe(`/topic/${topic}`, function (body, headers) {
          console.log(JSON.parse(body));
          that.emit("message", topic, body);
        });
      });
    });
  }
}

module.exports = StompClient;
