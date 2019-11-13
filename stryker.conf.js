"use strict";

module.exports = function(config) {
  config.set({
    mutator: "javascript",
    packageManager: "yarn",
    reporters: ["html", "clear-text", "progress"],
    testRunner: "command",
    transpilers: [],
    coverageAnalysis: "all"
  });
};
