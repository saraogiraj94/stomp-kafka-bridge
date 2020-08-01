const Bridge = require("./lib/bridge");
let config = require("./config.js");
const bridge = new Bridge(config);
bridge.on("error", console.error);
bridge.run().catch(console.error);
