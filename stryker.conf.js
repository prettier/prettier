"use strict";

module.exports = function(config) {
  config.set({
    mutator: "javascript",
    packageManager: "yarn",
    reporters: ["html", "clear-text", "progress"],
    testRunner: "command",
    commandRunner: {
      command: "npx jest --no-cache"
    },
    // TBD super-high timeout for now:
    timeoutMS: 9000000,
    transpilers: [],
    coverageAnalysis: "off"
  });
};
