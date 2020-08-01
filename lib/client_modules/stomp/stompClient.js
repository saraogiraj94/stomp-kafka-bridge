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
    this._msgPublished = 0;
  }

  async connect() {
    debug("Connecting....");

    const { user, password, port, address, version = "1.0" } = this._config;
    const { topics } = this._config;
    this.client = new stompClient(address, port, user, password, version);
    var that = this;
    this.client.connect(function (sessionId) {
      debug("Connected.....");
      that._connected = true;
      that._sessionId = sessionId;
      topics.forEach((topic) => {
        debug("Subscribing to " + topic + "....");
        that.client.subscribe(`/topic/${topic}`, function (body, headers) {
          that._msgPublished++;
          debug("Message Received for " + topic);
          that.emit("message", topic, body);
        });
      });
    });
  }

  getStats() {
    return {
      connected: this._connected,
      sessionId: this._sessionId,
      messages_published: this._msgPublished,
    };
  }

  close() {
    if (this.client) {
      this.client.disconnect();
    }
  }
}

module.exports = StompClient;
