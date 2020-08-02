const Bridge = require("./lib/bridge");
let config = require("./config.js");
const bridge = new Bridge(config);
bridge.on("error", (err) => {
  console.log(err);
  bridge.close();
});

bridge.run().catch(console.error);
