"use strict";

module.exports = function(config) {
  config.set({
    mutator: "javascript",
    mutate: [
      // [FUTURE TBD] this seems to take about 100 hours on a 40-CPU server in the cloud:
      // "src/**/*.js"
      // [TBD] limited testing related to language-js processing for now:
      "src/common/*.js",
      "src/language-js/*.js",
      "src/utils/*.js"
      // ...
    ],
    packageManager: "yarn",
    reporters: ["html", "clear-text", "progress"],
    testRunner: "command",
    commandRunner: {
      command: "npx jest --no-cache"
    },
    // TBD ???:
    timeoutMS: 15*60*1000,
    transpilers: [],
    coverageAnalysis: "off"
  });
};
