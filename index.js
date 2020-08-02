const Bridge = require("./lib/bridge");
let config = require("./config.js");
const bridge = new Bridge(config);
//Catching error and closing the bridge
bridge.on("error", (err) => {
  console.log(err);
  bridge.close();
});

bridge.run().catch(console.error);
